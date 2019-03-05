import React, { Component } from 'react';
import './App.css';

import {Sidebar} from '../components/Sidebar'
import {Profile} from '../components/Profile'
import {ReviewsList} from '../components/ReviewsList'
import {Footer} from '../components/Footer'
import {connect} from 'react-redux'
import methods from "../utilities/methods";
import reviewsData from '../data/reviews'
import userData from '../data/user'

// const { ipcRenderer } = window.require('electron')

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
        },
          reviews: []
      }

      //Mock Data
      setTimeout(() => {
        this.setState({
          user: userData,
          reviews: reviewsData
        })
      },1000)
      
      // setTimeout(() => {
      //     ipcRenderer.send('startCrawl', 'starting Crawl')
      //     this.setState({
      //         config:{
      //           ...this.state.config,
      //           scrapeStatus: 'Scraping...'
      //         }
      //     })
      // }, 1000)

      // ipcRenderer.on('profileReviewsHelpfulCounts', (event, profile) => {
      //     this.setState({
      //       user:{
      //         ...this.state.user,
      //         helpfulVotes: profile.helpfulVotes.helpfulVotesData.count,
      //         reviewsCount: profile.reviews.reviewsCountData.count
      //       }
      //     })
      //     console.log("state", this.state)
      // })    
      // ipcRenderer.on('profileNameRank', (event, profile) => {
      //     this.setState({
      //       user:{
      //         ...this.state.user,
      //         rank: profile.rank,
      //         name: profile.name
      //       }
      //     })
      //     console.log("state", this.state)
      // })      
      // ipcRenderer.on('reviewsScrapedSoFar', (event, reviewsCount) => {
      //     this.setState({
      //       config:{
      //         ...this.state.config,
      //         scrapeProgress: (this.state.user.reviewsCount)? methods.round(reviewsCount * 100 / this.state.user.reviewsCount, 0) : 0
      //       }
      //     })
      //     console.log("state", this.state)
      // })
      // ipcRenderer.on('reviewsScrapedInterrupted', (event, reviews) => {
      //     // @TODO show the user that only partially fetched and how much
      //     this.setState({
      //         reviews
      //     })
      //     console.log("state", this.state)
      // })
      // ipcRenderer.on('reviewsScraped', (event, reviews) => {
      //     console.log("reviews", reviews)
      //     this.setState({
      //         reviews
      //     })
      // })
      // ipcRenderer.on('scrapeComplete', (event, duration) => {
      //     this.setState({
      //         config: {
      //           ...this.state.config,
      //           scrapeStatus: `Scraping completed after ${duration} ms`
      //         }
      //     })
      // })
      // ipcRenderer.on('scrapeError', (event, message) => {
      //     console.error(message)
      //     this.setState({
      //         config:{
      //           ...this.state.config,
      //           scrapeStatus: message
      //         }
      //     })
      // })
  }

  render() {
    return (
        <div className="App">
          <Sidebar user={this.state.user}/>
          <div class='nav'>
            <div className='link'>Link</div>
            <div className='link'>Link2</div>
            <div className='link'>Link3</div>
          </div>
          <div class='main'>
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
