import React, { Component } from 'react';
import './App.css';

import {Sidebar} from '../components/Sidebar'
import {ReviewsList} from '../components/ReviewsList'
import {connect} from 'react-redux'
import methods from "../utilities/methods";
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

      //Mock Data
      // setTimeout(() => {
      //   this.setState({
      //     user: userData,
      //     reviews: reviewsData
      //   })
      // },1000)

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
    ipcRenderer.send('startCrawl', {url: 'https://www.amazon.de/gp/profile/amzn1.account.AGUP6NOURWV4NFAP3VBYROSCRHLQ', complete:complete})
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
        <div className="App">
          <Sidebar user={this.state.user} config={this.state.config} startCrawlClickHandler={this.startCrawlClickHandler.bind(this)}/>
          <div className='nav'>
            <div className='link'><i className="material-icons">history</i></div>
            <div className='link'><i className="material-icons">list</i></div>
            <div className='link'><i className="material-icons">settings</i></div>
          </div>
          <div className='main'>
            <ReviewsList reviews={this.state.reviews} config={this.state.config} />
          </div>
        </div>
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
