import React, { useEffect, useState } from "react"
import { HistoryItem } from "../HistoryItem";
import { ProgressBar } from "../progressBar";
import { ToTopButton } from "../ToTopButton";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";

import {methods} from "../../utilities/methods";

export const History = ({config, status, reviews}) => {

    // limit shown number at the start of the component
    const [loadedHistoryItemsCount, setLoadedHistoryItemsCount] = useState(10)
    const [showMoreHistoryItemsBlocked, setShowMoreHistoryItemsBlocked] = useState(false)

    useEffect(() => {
        showMoreHistoryItems()
    }, [])

    const showMoreHistoryItems = () => {
        // Increase the number of displayed reviews to higher amount.
        if(showMoreHistoryItemsBlocked){
            console.log("Loading of more HistoryItems blocked while searching");
        }else{
            setLoadedHistoryItemsCount(loadedHistoryItemsCount + 30)
            console.log("More HistoryItems loaded");
        }
    }

    if(methods.fetchURLData(config.fetchURL)){
        let loadedReviews = reviews;
        //Sort by last syncTimestamp
        methods.sortObjectArray(loadedReviews, 'syncTimestamp', false)

        const historyComponents =
            loadedReviews.filter(review => config.fetchURL.includes(review.userId) && review.reviewHistory.length)
            .slice(0, loadedHistoryItemsCount)
            .map(review => 
                <HistoryItem key={review.externalId} config={config} review={review} />
            )
            
        return (
            <div className="history">
                <ToTopButton arrivingAtTopAction={() => setLoadedHistoryItemsCount(40)}/>
                <h1>History</h1>
                <ProgressBar progress={status.scrapeProgress}></ProgressBar>
                <div className="sentinel"></div>
                {!historyComponents.length && 

                    <div className="reviewItem review-notification reviewItemsWrapper"><span>No reviews found</span></div>
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