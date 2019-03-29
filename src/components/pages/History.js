import React from "react"
import {HistoryItem} from "../HistoryItem";
import { ProgressBar } from "../progressBar";

import {methods} from "../../utilities/methods";

export const History = ({config, status, reviews})  => {

    if(methods.fetchURLData(config.fetchURL)){
        let loadedReviews = reviews;
        //Sort by last syncTimestamp
        methods.sortObjectArray(loadedReviews, 'syncTimestamp', false)

        const historyComponents = loadedReviews.filter(review => config.fetchURL.includes(review.userId) && review.reviewHistory.length)
            .map(review => 
                <HistoryItem key={review.externalId} review={review} />
            )
            
        return (
            <div className="history">
                <h1>History</h1>
                <ProgressBar progress={status.scrapeProgress}></ProgressBar>
                <div className="historyItemWrapper">
                    {historyComponents}
                </div>
                {!historyComponents.length && 
                    <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
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