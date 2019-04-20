import React, {Component} from "react"
import { methods } from "../utilities/methods";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({config, date, updatedReviews}) => {

    const localeDateOptions = {year: '2-digit', month: '2-digit', day: '2-digit' };

    // let itemHistory = reviewHistory.map(historySubItem => {
    //     for (const prop in historySubItem){
    //         if(prop != "syncTimestamp"){
    //             return(
    //                 <div key={historySubItem.syncTimestamp} className="historySubItem card selectable">
    //                     <b>{prop}</b> (Fetched: {new Date(historySubItem.syncTimestamp).toLocaleDateString(config.language, localeDateOptions)})<br/>
    //                     old: {''+historySubItem[prop]}, new: {''+review[prop]}
    //                 </div>
    //             )
    //         }
    //     }
    // })

    return(
        <div className='reviewItemsWrapper'>
            <div className="historySubItem">
                Updated: {new Date(date).toLocaleDateString(config.language, localeDateOptions) + ', ' + new Date(date).toLocaleTimeString(config.language)}
            </div>
            <div>
                {updatedReviews.map(review => 
                    <div key={review.externalId} className="historySubItem selectable">
                        <div className="truncateString columnProductTitle">
                            {methods.getProductTitle(review)}
                        </div>
                        <div className="paramUpdateWrapper">
                            {review.updatedParams.map(param => {
                                const updateDifference = review[param] - review.reviewHistory[0][param]
                                return (
                                    <div className="paramUpdate" key={param}>
                                        {param}
                                        <i className="material-icons">
                                            {param === 'helpfulVotes'? 'thumb_up' : ''}
                                            {param === 'reviewsCount'? 'assignment' : ''}
                                            {param === 'comments'? 'comment' : ''}
                                        </i>
                                        {(updateDifference > 0 ? '+':'')}
                                        {updateDifference}
                                    </div>
                                )
                            }
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
