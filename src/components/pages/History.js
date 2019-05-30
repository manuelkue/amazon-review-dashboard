import React, { useEffect, useState } from "react";
import { HistoryItem } from "../HistoryItem";
import { ProgressBar } from "../progressBar";
import { ToTopButton } from "../ToTopButton";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";

import {methods} from "../../utilities/methods";

const History = ({config, status, reviews, reviewFunctions}) => {

    // limit shown number at the start of the component
    const [maxHistorySubItemsCount, setMaxHistorySubItemsCount] = useState(30)
    const [showMoreHistoryItemsBlocked, setShowMoreHistoryItemsBlocked] = useState(false)

    let alreadyLoadedHistorySubItems = 0;

    useEffect(() => {
        // showMoreHistoryItems()
    }, [])

    useEffect(() => {
        console.log("More HistoryItems loaded, now:", maxHistorySubItemsCount);
    }, [maxHistorySubItemsCount])

    const showMoreHistoryItems = () => {
        // Increase the number of displayed reviews to higher amount.
        if(showMoreHistoryItemsBlocked){
            console.log("Loading of more HistoryItems blocked while searching");
        }else{
            setMaxHistorySubItemsCount(maxHistorySubItemsCount + 30)
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

        const historyComponents = allSyncTimestamps.map((timestamp, index) => {
            const updatedReviewsOnTimestamp =
                loadedReviews
                    .filter(review => review.syncTimestamp === timestamp || review.reviewHistory.some(reviewUpdate => reviewUpdate.syncTimestamp === timestamp))
                    .map(review => {
                        // reviewHistoryElement is mapped to reviewItem -> you get the review like it was at the syncTimestamp
                        // reviewHistoryItems that are newer or the same as the selected timestamp are removed so you can compare the updatedReview to it's former state
                        if (review.syncTimestamp === timestamp){
                            return review
                        }
                        const mappedReview = {...review, ...review.reviewHistory.find(reviewUpdate => reviewUpdate.syncTimestamp === timestamp)}
                        mappedReview.reviewHistory = mappedReview.reviewHistory.filter(reviewUpdate => reviewUpdate.syncTimestamp < timestamp)
                        return mappedReview
                    })

                    //@TODO: .filter(review => review.reviewHistory.includes('helpfulVotes...')) oder ähnlich, um eine Auswahl nach Neuigkeiten anzuzeigen

            alreadyLoadedHistorySubItems += updatedReviewsOnTimestamp.length
            const yetToLoadHistorySubItemsCount = maxHistorySubItemsCount - alreadyLoadedHistorySubItems + updatedReviewsOnTimestamp.length
            return yetToLoadHistorySubItemsCount > 0?
                <HistoryItem
                    key = {timestamp}
                    config = {config}
                    date = {timestamp}
                    updatedReviews = {updatedReviewsOnTimestamp}
                    reviewFunctions = {reviewFunctions}
                    yetToLoadHistorySubItemsCount = {yetToLoadHistorySubItemsCount}
                />
                : null
        })


        return (
            <div className="history">
                <ToTopButton arrivingAtTopAction={() => setMaxHistorySubItemsCount(30)}/>
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

export default History;