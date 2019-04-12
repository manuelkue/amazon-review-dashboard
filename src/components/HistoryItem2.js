import React, {Component} from "react"
import { methods } from "../utilities/methods";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem2 = ({config, review}) => {

    let reviewHistory = review.reviewHistory;
    methods.sortObjectArray(reviewHistory, 'syncTimestamp', false);

    const localeDateOptions = {year: '2-digit', month: '2-digit', day: '2-digit' };

    let itemHistory = reviewHistory.map(historySubItem => {
        for (const prop in historySubItem){
            if(prop != "syncTimestamp"){
                return(
                    <div key={historySubItem.syncTimestamp} className="historySubItem card selectable">
                        <b>{prop}</b> (Fetched: {new Date(historySubItem.syncTimestamp).toLocaleDateString(config.language, localeDateOptions)})<br/>
                        old: {''+historySubItem[prop]}, new: {''+review[prop]}
                    </div>
                )
            }
        }
    })

    return(
        <div className='historyItem card'>
            <div>Updated: {new Date(review.syncTimestamp).toLocaleDateString(config.language, localeDateOptions) + ', ' + new Date(review.syncTimestamp).toLocaleTimeString(config.language)}</div>
            <div className="truncateString">{methods.getProductTitle(review)}</div>
            <div>{review.userRating} <i className="material-icons" style={{fontSize : '12px'}}>star</i></div>
            <div>Review from: {new Date(review.date).toLocaleDateString(config.language, localeDateOptions)}</div>
            {itemHistory}
        </div>
    )
}
