import React from "react"
import {HistoryItem} from "../HistoryItem";

import {methods} from "../../utilities/methods";

export const History = ({config, reviews})  => {

    if(methods.fetchURLData(config.fetchURL)){
        methods.sortObjectArray(reviews, config.sortReviewsBy, config.sortReviewsAscending)
        const historyComponents = reviews.filter(review => config.fetchURL.includes(review.userId) && review.reviewHistory.length)
            .map(review => 
                <HistoryItem key={review.externalId} review={review} />
            )
            
        return (
            <div className="history">
                <h1>History</h1>
                <div style={{display: 'block', height:5+'px', background: 'var(--color-secondary)', width: config.scrapeProgress + '%'}}></div>
                <div className="historyItemWrapper">
                    {historyComponents}
                </div>
                {!historyComponents.length && 
                    <div className="review-item review-notification"><span>Reviews loaded: {config.scrapeProgress}%</span></div>
                }
            </div>
        )
    }else{
        return (
            <div className="history">
                <h1>History</h1>
                <div className="review-item review-notification"><span>Please specify a URL in the settings that should be used for fetching review data.</span></div>
            </div>
        )
    }
}