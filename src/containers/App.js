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
      name: null
    },
    reviews: []
  }
});
      
//@TODO: in settings: save to disk
const configStorage = new Storage({
  configName: 'appConfig',
  defaults: {
    fetchURL:''
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
          name: "null"
        },
        config:{
          fetchURL:'',
          fetchURLGetsValidated:'',
          fetchURLValid:false,
          maxReviewNumberOnPartScrape:50,
          sortReviewsBy:null,
          sortReviewsAscending:false,
          scrapeStatus: "-",
          scrapeProgress: 0,
          isScrapingComplete: false,
          isScrapingPartially: false,
          appInitStarted: false
        },
          reviews: []
      }
      //@TODO: Function to click on reviewHeaders and change this.state.config.sortReviewsBy:'helpfulVotes', ...sortReviewsAscending:false


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
              name: profile.name
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
        console.error("Scraping by Amazon interrupted, saved Reviews that were loaded so far")
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
                scrapeStatus: `Scraping completed after ${methods.round(duration/1000, 1)} s`,
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
              <Route path="/settings" render={() => <Settings config={this.state.config} saveNewFetchURL={this.saveNewFetchURL} />} />
            </Switch>

            </div>
          </div>
        </Router>
    );
  }

  componentDidMount(){
    this.initAppFromStorage().then(() => {
      this.saveNewFetchURL({target:{value:this.state.config.fetchURL}})
    });
  }

  startCrawlClickHandler(maxReviewNumber, onlyProfile = false){
    ipcRenderer.send('startCrawl', {url: this.state.config.fetchURL, maxReviewNumber:maxReviewNumber, onlyProfile})
    this.setState({
        config:{
          ...this.state.config,
          scrapeStatus: 'Scraping... ' +  this.state.config.scrapeProgress + '%',
          isScrapingComplete: maxReviewNumber === 99999,
          isScrapingPartially:maxReviewNumber !== 99999
        }
    })
  }

  saveNewFetchURL = (event) => {
    // events get nullified after first processing round and are not available to async functions
    // have to be saved if they should be processed further (here in callback after setState)
    const url = event.target.value
    console.log("URL objects", methods.fetchURLData(url))
    this.setState({
      config:{
        ...this.state.config,
        fetchURLGetsValidated: url,
        fetchURLValid: !!methods.fetchURLData(url)
      }
    }, () => {
      console.log("valid?", this.state.config.fetchURLValid)
      if(this.state.config.fetchURLValid){
        this.setState({
          config:{
            ...this.state.config,
            fetchURL: url
          }
        })
        configStorage.set('fetchURL', url)
      }
    })
  }

  async initAppFromStorage(){
    if(!this.state.config.appInitStarted){

      this.setState({
        config:{
          ...this.state.config,
          appInitStarted:true
        }
      })

      console.log('AppInit start')
      await configStorage.get('fetchURL')
      .then(fetchURL => {
        this.setState({
          config:{
            ...this.state.config,
            fetchURL: methods.fetchURLData(fetchURL).profileURL
          }
        })
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))
  
      await fetchStorage.get('user')
      .then(user => {
        console.log("User fetched from storage", user)
        this.setState({user})
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))
  
      await fetchStorage.get('reviews')
      .then(reviews => {
        this.setState({reviews: reviews})
      }).catch(err => console.log("Trying to read file: No reviews safed to disk so far"))

      console.log('AppInit end')
    }else{
      console.log('AppInit already started')
    }
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
