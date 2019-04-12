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
        <div className='historyItem card'>
            <div>Updated: {new Date(date).toLocaleDateString(config.language, localeDateOptions) + ', ' + new Date(date).toLocaleTimeString(config.language)}</div>
        </div>
    )
}
