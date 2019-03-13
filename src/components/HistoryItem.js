import React, {Component} from "react"

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({review}) => {

    const itemHistory = review.reviewHistory.map(historySubItem => {
        for (const prop in historySubItem){
            if(prop != "syncTimestamp"){
                return(
                    <div key={historySubItem.syncTimestamp} className="historySubItem card selectable">
                        <b>{prop}</b> (Updated: {new Date(historySubItem.syncTimestamp).toLocaleDateString()})<br/>
                        old: {historySubItem[prop]}, new: {review[prop]}
                    </div>
                )
            }
        }
    })

    return(
        <div className='historyItem card'>
            <div>{review.productTitle || <i>not available anymore</i>}</div>
            <div>{review.userRating}</div>
            <div>{new Date(review.date).toLocaleDateString()}</div>
            {itemHistory}
        </div>
    )
}
