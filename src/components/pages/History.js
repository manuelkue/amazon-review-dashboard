import React, { useEffect, useState } from "react";
import { HistoryItem } from "../HistoryItem";
import { HistoryItem2 } from "../HistoryItem2";
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
        const loadedReviews = [...reviews];
        //Sort by last date, then syncTimestamp
        methods.sortArray(loadedReviews, 'date', false)
        methods.sortArray(loadedReviews, 'syncTimestamp', false)




        // Mapping / Grouping all reviews due to their syncTimestamp
        // @TODO: Add timestamps of reviewUpdates in reviewHistory, too. Sometimes every review.syncTimestamp is not every syncTimestamp
        const allSyncTimestamps = [...new Set(loadedReviews.map(review => review.syncTimestamp))];

        const historyComponents2 = allSyncTimestamps.map(timestamp => {
            const updatedReviewsOnTimestamp =
                loadedReviews
                    .filter(review => review.syncTimestamp === timestamp || review.reviewHistory.some(reviewUpdate => reviewUpdate.syncTimestamp === timestamp))
                    .map(review => {
                        // reviewHistoryElement is mapped to reviewItem -> you get the review like it was at the syncTimestamp
                        // reviewHistoryItems that are newer or the same as the selected timestamp are removed so you can compare the updatedReview to it's former state
                        if (review.syncTimestamp === timestamp) return review
                        const mappedReview = {...review, ...review.reviewHistory.find(reviewUpdate => reviewUpdate.syncTimestamp === timestamp)}
                        mappedReview.reviewHistory = mappedReview.reviewHistory.filter(reviewUpdate => reviewUpdate.syncTimestamp < timestamp)
                        return mappedReview
                    })
            return <HistoryItem key={timestamp} config={config} date={timestamp} updatedReviews={updatedReviewsOnTimestamp} />
        })






        const historyComponents =
            loadedReviews.filter(review => review.reviewHistory.length)
            .slice(0, loadedHistoryItemsCount)
            .map(review => 
                <HistoryItem2 key={review.externalId} config={config} review={review} />
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
                    {historyComponents2}
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