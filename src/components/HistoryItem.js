import React, {Component} from "react"
import { methods } from "../utilities/methods";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({review}) => {

    let reviewHistory = review.reviewHistory;
    methods.sortObjectArray(reviewHistory, 'syncTimestamp', false);

    let itemHistory = reviewHistory.map(historySubItem => {
        for (const prop in historySubItem){
            if(prop != "syncTimestamp"){
                return(
                    <div key={historySubItem.syncTimestamp} className="historySubItem card selectable">
                        <b>{prop}</b> (Fetched: {new Date(historySubItem.syncTimestamp).toLocaleDateString()})<br/>
                        old: {historySubItem[prop]}, new: {review[prop]}
                    </div>
                )
            }
        }
    })

    let formerProductTitle = <span className="productDeleted">not available anymore</span>

    if(!review.productTitle && review.reviewHistory.find(historyItem => historyItem.productTitle)){
        console.log('reviewHistory :', reviewHistory);
        formerProductTitle = <span className="productDeleted">{review.reviewHistory.find(historyItem => historyItem.productTitle).productTitle}</span>
    }

    return(
        <div className='historyItem card'>
        <div>Updated: {new Date(review.syncTimestamp).toLocaleDateString() + ', ' + new Date(review.syncTimestamp).toLocaleTimeString()}</div>
            <div>{review.productTitle || formerProductTitle}</div>
            <div>{review.userRating}</div>
            <div>Date: {new Date(review.date).toLocaleDateString()}</div>
            {itemHistory}
        </div>
    )
}
