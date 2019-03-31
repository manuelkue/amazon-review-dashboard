import React, { useEffect, useState, Component } from "react"
import { HistoryItem } from "../HistoryItem";
import { ProgressBar } from "../progressBar";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";

import {methods} from "../../utilities/methods";

export class History extends Component{

    constructor(props){
        super()

        // limit shown number at the start of the component
        this.state = {
            loadedHistoryItemsCount : 30
        }
    }

    render(){
        const {config, status, reviews} = this.props
        
        if(methods.fetchURLData(config.fetchURL)){
            let loadedReviews = reviews;
            //Sort by last syncTimestamp
            methods.sortObjectArray(loadedReviews, 'syncTimestamp', false)

            const historyComponents =
                loadedReviews.filter(review => config.fetchURL.includes(review.userId) && review.reviewHistory.length)
                .slice(0, this.state.loadedHistoryItemsCount)
                .map(review => 
                    <HistoryItem key={review.externalId} review={review} />
                )
                
            return (
                <div className="history">
                    <h1>History</h1>
                    <ProgressBar progress={status.scrapeProgress}></ProgressBar>
                    {!historyComponents.length && 
                        <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                    }
                    <div className="historyItemWrapper">
                        {historyComponents}
                    </div>
                    {!!historyComponents.length && 
                        <InfinitLoadingSentinel actionOnIntersecting={this.showMoreHistoryItems.bind(this)} distanceToBottom={200} />
                    }
                </div>
            )
        }else{
            return (
                <div className="history">
                    <h1>History</h1>
                    <div className="reviewItem review-notification"><span>Please specify a URL in the user area that should be used for fetching review data.</span></div>
                </div>
            )
        }
    }

    showMoreHistoryItems(){
        this.setState({
            loadedHistoryItemsCount: this.state.loadedHistoryItemsCount + 1000
        })
        console.log("More HistoryItems loaded");
    }

    componentDidMount(){
        // Increase the number of displayed reviews to higher amount.
        //@TODO: Find out why this has to happen in a Timeout. Without, the render() at start waits for the setState...
        setTimeout(() => {
            this.setState({
                loadedHistoryItemsCount: 1000
            })
        }, 0);
    }
}