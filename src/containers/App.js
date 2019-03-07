import React, { Component } from 'react';
import { Route, NavLink, BrowserRouter as Router } from 'react-router-dom'
import './App.css';

import {Sidebar} from '../components/Sidebar'
import {ReviewsList} from '../components/ReviewsList'
import {History} from '../components/History'
import {Settings} from '../components/Settings'
import {connect} from 'react-redux'
import {methods} from "../utilities/methods";
import {Storage} from "../utilities/Storage";
import {Review} from "../Models/Review";
import reviewsData from '../data/reviews'
import userData from '../data/user'

const { ipcRenderer } = window.require('electron')

class App extends Component {
  constructor(props) {
      super(props)
      this.state = {
        user:{
          id:null,
          rank: "null",
          helpfulVotes: "null",
          reviewsCount: "null",
          name: "null",
        },
        config:{
          scrapeStatus: "null",
          scrapeProgress: 0,
          isScrapingComplete: false,
          isScrapingPartially: false
        },
          reviews: []
      }
      
      
      const configStorage = new Storage({
        configName: 'user-preferences',
        defaults: {
          windowBounds: { width: 800, height: 600 }
        }
      });
      const reviewStorage = new Storage({
        configName: 'reviews',
        defaults: {
          reviews: []
        }
      });



      //Mock Data
      setTimeout(() => {
        this.setState({
          user: userData,
          reviews: reviewsData
        })
      },1000)

      
      methods.saveReviews(reviewsData);

      ipcRenderer.on('profileReviewsHelpfulCounts', (event, profile) => {
          this.setState({
            user:{
              ...this.state.user,
              helpfulVotes: profile.helpfulVotes.helpfulVotesData.count,
              reviewsCount: profile.reviews.reviewsCountData.count
            }
          })
          console.log("state", this.state)
      })    
      ipcRenderer.on('profileNameRank', (event, profile) => {
          this.setState({
            user:{
              ...this.state.user,
              rank: profile.rank,
              name: profile.name
            }
          })
          console.log("state", this.state)
      })      
      ipcRenderer.on('reviewsScrapedSoFar', (event, reviewsCount) => {
          this.setState({
            config:{
              ...this.state.config,
              scrapeProgress: (this.state.user.reviewsCount)? methods.round(reviewsCount * 100 / this.state.user.reviewsCount, 0) : 0
            }
          })
          console.log("state", this.state)
      })
      ipcRenderer.on('reviewsScrapedInterrupted', (event, reviews) => {
          // @TODO show the user that only partially fetched and how much
          this.setState({
              reviews
          })
          console.log("state", this.state)
      })
      ipcRenderer.on('reviewsScraped', (event, reviews) => {
          console.log("reviews", reviews)
          methods.saveReviews(reviews);
          this.setState({
              reviews
          })
      })
      ipcRenderer.on('scrapeComplete', (event, duration) => {
          this.setState({
              config: {
                ...this.state.config,
                scrapeStatus: `Scraping completed after ${duration} ms`,
                isScrapingComplete: false,
                isScrapingPartially: false
              }
          })
      })
      ipcRenderer.on('scrapeError', (event, message) => {
          console.error(message)
          this.setState({
              config:{
                ...this.state.config,
                scrapeStatus: message,
                isScrapingComplete: false,
                isScrapingPartially: false
              }
          })
      })

  }

  startCrawlClickHandler(complete){
    ipcRenderer.send('startCrawl', {url: 'https://www.amazon.de/gp/profile/amzn1.account.AG4PLE2SL7LDA33T24LPR3BF2K4A', complete:complete})
    this.setState({
        config:{
          ...this.state.config,
          scrapeStatus: 'Scraping...',
          isScrapingComplete:complete,
          isScrapingPartially:!complete
        }
    })
  }

  render() {

    return (
        <Router>
          <div className="App">
            <Sidebar user={this.state.user} config={this.state.config} startCrawlClickHandler={this.startCrawlClickHandler.bind(this)}/>
            <div className='nav'>
              <NavLink exact to="/" className='link' activeClassName='selected'><i className="material-icons">history</i></NavLink>
              <NavLink to="/reviews" className='link' activeClassName='selected'><i className="material-icons">list</i></NavLink>
              <NavLink to="/settings" className='link' activeClassName='selected'><i className="material-icons">settings</i></NavLink>
            </div>
            <div className='main'>
            
              <Route exact path="/"   render={() => <History config={this.state.config}  />}/>
              <Route path="/reviews"  render={() => <ReviewsList reviews={this.state.reviews} config={this.state.config} />}/>
              <Route path="/settings" render={() => <Settings config={this.state.config} />} />

            </div>
          </div>
        </Router>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    config: state.config,
    user: state.user,
    reviews: state.reviews
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setUserName: name => {
      dispatch({
        type: 'SET_USER_NAME',
        payload: name
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
