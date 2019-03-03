import React, { Component } from "react"
import reviewsData from "../data/Reviews";
import ReviewItemComponent from "./ReviewItemComponent";
import utilities from "../utilities/utilities"
const { ipcRenderer } = window.require('electron')

class ReviewsListComponent extends Component{
    constructor() {
        super()
        this.state = {
            scrapeStatus: null,
            rank: null,
            helpfulVotes: null,
            reviewsCount: null,
            reviewsBy: null,
            loadingProgress: 0,

            reviews: []
        }
        
        setTimeout(() => {
            console.log("starting crawl")
            ipcRenderer.send('startCrawl', 'starting Crawl')
            this.setState({
                scrapeStatus: 'Scraping...'
            })
        }, 1000)

        ipcRenderer.on('profileScraped', (event, profile) => {
            console.log("UserProfile", profile)
            this.setState({
                rank: profile.rank,
                helpfulVotes: profile.helpfulVotes.helpfulVotesData.count,
                reviewsCount: profile.reviews.reviewsCountData.count,
                reviewsBy: profile.name
            })
        })        
        ipcRenderer.on('reviewsScrapedSoFar', (event, reviewsCount) => {
            this.setState({
                loadingProgress: (this.state.reviewsCount)? utilities.round((reviewsCount / this.state.reviewsCount) * 100, 0) : 0
            })
        })
        ipcRenderer.on('reviewsScraped', (event, reviews) => {
            console.log("reviews", reviews)
            this.setState({
                reviews
            })
        })
        ipcRenderer.on('scrapeComplete', (event, duration) => {
            this.setState({
                scrapeStatus: `Scraping completed after ${duration} ms`
            })
        })
        ipcRenderer.on('scrapeError', (event, message) => {
            console.error(message)
            this.setState({
                scrapeStatus: message
            })
        })
    }

    render() {
        const reviewsComponents = this.state.reviews.map(review =>
            <ReviewItemComponent key={review.id} review={review} />
        )

        return (
            <div>
                <div className="profile-details">
                    <div>Status: {this.state.scrapeStatus}</div>
                    <div>Name: {this.state.reviewsBy}</div>
                    <div>Rank: {this.state.rank}</div>
                    <div>Helpful votes: {this.state.helpfulVotes}</div>
                    <div>Reviews: {this.state.reviewsCount}</div>
                </div>
                <div className="reviews-list">
                    <div className="review-item reviews-header">
                        <div>External Id</div>
                        <div>Product Title</div>
                        <div>Review Title</div>
                        <div>Average Rating</div>
                        <div>Your Rating</div>
                        <div>Helpful Votes</div>
                        <div>Datum</div>
                    </div>
                    {reviewsComponents}
                    {!this.state.reviews.length && 
                        <div className="review-item review-notification"><span>Reviews loaded: {this.state.loadingProgress}%</span></div>
                    }
                </div>
            </div>
        )
    }
}

export default ReviewsListComponent
