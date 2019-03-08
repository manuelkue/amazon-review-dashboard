import React, { Component } from 'react';
import { Route, NavLink, Switch, BrowserRouter as Router } from 'react-router-dom'
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

const fetchStorage = new Storage({
  configName: 'fetchedData',
  defaults: {
    user: {
      id:null,
      rank: null,
      helpfulVotes: null,
      reviewsCount:null,
      name: null,
      pictureURL: ''
    },
    reviews: []
  }
});
      
const configStorage = new Storage({
  configName: 'appConfig',
  defaults: {
    fetchURL:'https://www.amazon.de/gp/profile/amzn1.account.AHIML2WDUBRNHH47SS5PZEWVBOJA'
  }
});

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
          pictureURL: ''
        },
        config:{
          fetchURL:'',
          scrapeStatus: "-",
          scrapeProgress: 0,
          isScrapingComplete: false,
          isScrapingPartially: false
        },
          reviews: []
      }

      //ComponentDidMount-Logic. Unfortunately ComponentDidMount doesn't fire at the start of the app
      configStorage.get('fetchURL')
      .then(fetchURL => {
        this.setState({
          config:{
            ...this.state.config,
            fetchURL: methods.fetchURLData(fetchURL).url
          }
        })
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))
  
      fetchStorage.get('user')
      .then(user => {
        console.log("User fetched from storage", user)
        this.setState({user})
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))
  
      fetchStorage.get('reviews')
      .then(reviews => {
        this.setState({reviews: reviews})
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))


      ipcRenderer.on('profileReviewsHelpfulCounts', (event, profile) => {
          this.setState({
            user:{
              ...this.state.user,
              helpfulVotes: profile.helpfulVotes.helpfulVotesData.count,
              reviewsCount: profile.reviews.reviewsCountData.count
            }
          })
          fetchStorage.set('user', this.state.user)
          .catch(err => console.error(err))
      })    
      ipcRenderer.on('profileNameRank', (event, profile) => {
          this.setState({
            user:{
              ...this.state.user,
              rank: profile.rank,
              name: profile.name,
              pictureURL: profile.profilePictureURL
            }
          })
          console.log("state", this.state)
          fetchStorage.set('user', this.state.user)
          .catch(err => console.error(err))
      })      
      ipcRenderer.on('reviewsScrapedSoFar', (event, reviewsCount) => {
        //@TODO: Save reviews scraped so far, to get newest reviews if Amazon blocks
          this.setState({
            config:{
              ...this.state.config,
              scrapeProgress: (this.state.user.reviewsCount)? methods.round(reviewsCount * 100 / this.state.user.reviewsCount, 0) : 0
            }
          })
          console.log("ScrapeProgress", this.state.config.scrapeProgress)
      })
      ipcRenderer.on('reviewsScrapedInterrupted', (event, reviews) => {
        // @TODO show the user that only partially fetched and how much, !!!!Toast erzeugen!!!!!
        console.error("Scraping by Amazon interrupted, saved Reviews loaded until now")
        methods.saveReviews(reviews, this.state.config.fetchURL).then(() => {
          fetchStorage.get('reviews').then(reviews => {
            this.setState({
              reviews: reviews
            })
          }).catch(err => console.error(err))
        })
        .catch(err => console.error(err));
      })
      ipcRenderer.on('reviewsScraped', (event, reviews) => {
          console.log("reviews", reviews)
        methods.saveReviews(reviews, this.state.config.fetchURL).then(() => {
          fetchStorage.get('reviews').then(reviews => {
            this.setState({
              reviews: reviews
            })
          }).catch(err => console.error(err))
        })
        .catch(err => console.error(err));
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
    ipcRenderer.send('startCrawl', {url: this.state.config.fetchURL, complete:complete})
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

            <Switch>
              <Route exact path="/"   render={() => <History config={this.state.config}  />}/>
              <Route path="/reviews"  render={() => <ReviewsList reviews={this.state.reviews} config={this.state.config} />}/>
              <Route path="/settings" render={() => <Settings config={this.state.config} />} />
            </Switch>

            </div>
          </div>
        </Router>
    );
  }

  componentDidMount(){
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
