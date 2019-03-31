import React, { useEffect, useState } from "react"
import { HistoryItem } from "../HistoryItem";
import { ProgressBar } from "../progressBar";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";

import {methods} from "../../utilities/methods";

export const History = ({config, status, reviews})  => {

    const [loadedHistoryItemsCount, setLoadedHistoryItemsCount] = useState(30)

    function showMoreHistoryItems(){
        setLoadedHistoryItemsCount(loadedHistoryItemsCount + 1000);
        console.log("More HistoryItems loaded");
    }

    useEffect(() => {
        // Increase the number of displayed historyItems to higher amount.
        setLoadedHistoryItemsCount(1000);
    })
    
    if(methods.fetchURLData(config.fetchURL)){
        let loadedReviews = reviews;
        //Sort by last syncTimestamp
        methods.sortObjectArray(loadedReviews, 'syncTimestamp', false)

        const historyComponents =
            loadedReviews.filter(review => config.fetchURL.includes(review.userId) && review.reviewHistory.length)
            .slice(0, loadedHistoryItemsCount)
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
                    <InfinitLoadingSentinel actionOnIntersecting={showMoreHistoryItems} distanceToBottom={200} />
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