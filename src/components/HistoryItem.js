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
                        old: {''+historySubItem[prop]}, new: {''+review[prop]}
                    </div>
                )
            }
        }
    })

    return(
        <div className='historyItem card'>
        <div>Updated: {new Date(review.syncTimestamp).toLocaleDateString() + ', ' + new Date(review.syncTimestamp).toLocaleTimeString()}</div>
        <div className="truncateString">{methods.getProductTitle(review)}</div>
        <div>{review.userRating} <i className="material-icons" style={{fontSize : '12px'}}>star</i></div>
        <div>Review from: {new Date(review.date).toLocaleDateString()}</div>
            {itemHistory}
        </div>
    )
}
