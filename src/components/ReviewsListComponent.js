import React, { Component } from "react"
import reviewsData from "../data/Reviews";
import ReviewItemComponent from "./ReviewItemComponent";
const { ipcRenderer } = window.require('electron')

class ReviewsListComponent extends Component{
    constructor() {
        super()
        this.state = {
            scrapeStatus: null,
            helpfulVotes: null,
            reviesCount: null,
            reviewsBy: "Manuel"
        }
        
        setTimeout(() => {
            console.log("starting crawl")
            ipcRenderer.send('startCrawl', 'starting Crawl')
            this.setState({
                scrapeStatus: 'Scraping...'
            })
        }, 1000)
    }

    render() {
        const reviewsComponents = reviewsData.map(review =>
            <ReviewItemComponent key={review.id} review={review} />
        )

        ipcRenderer.on('scraping', (event, reviews) => {
            console.log(reviews)
        })
        ipcRenderer.on('profileScraped', (event, profile) => {
            console.log("UserProfile", profile)
            this.setState({
                helpfulVotes: profile.helpfulVotes.helpfulVotesData.count,
                reviesCount: profile.reviews.reviewsCountData.count
            })
        })
        ipcRenderer.on('scrapeComplete', (event, reviews) => {
            console.log("Scrape complete", reviews)
            this.setState({
                scrapeStatus: 'Scraping completed'
            })
        })
        ipcRenderer.on('scrapeError', (event, message) => {
            console.error(message)
            this.setState({
                scrapeStatus: message
            })
        })

        return (
            <div className="reviews-list">
                <p>Status: {this.state.scrapeStatus}</p>
                <p>Helpful votes: {this.state.helpfulVotes}</p>
                <p>Reviews: {this.state.reviesCount}</p>
                <p>Author: {this.state.reviewsBy}</p>
                <form>
                    {reviewsComponents}
                </form>
            </div>
        )
    }
}

export default ReviewsListComponent
