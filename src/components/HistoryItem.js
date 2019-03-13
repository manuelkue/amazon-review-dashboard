import React, {Component} from "react"

// @TODO zu functional component umbauen, wenn clicked-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({review}) => {

    const itemHistory = review.reviewHistory.map(historySubItem => {
        for (const prop in historySubItem){
            if(prop != "syncTimestamp"){
                return(
                    <div key={historySubItem.syncTimestamp} className="historySubItem">
                        <b>Updated on {new Date(historySubItem.syncTimestamp).toLocaleDateString()}: {prop}</b><br/>
                        old: {historySubItem[prop]}, new: {review[prop]}
                    </div>
                )
            }
        }
    })

    return(
        <div className='history-item card'>
            <div>{review.productTitle || <i>not available anymore</i>}</div>
            <div>{review.reviewTitle}</div>
            <div>{review.userRating}</div>
            <div>{new Date(review.date).toLocaleDateString()}</div>
            {itemHistory}
        </div>
    )
}
