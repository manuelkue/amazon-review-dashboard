import React from "react"
import CountUp from 'react-countup';
import { methods } from "../utilities/methods";

export const Syncarea = ({user, config, status, startCrawlClickHandler}) => {

    let updatedParams = [];
    let lastSyncUpdateDate = 'never'


    if (user){
        let userHistory = user.userHistory;
        methods.sortObjectArray(userHistory, 'syncTimestamp', false)

        if(user.updatedParams.length){
            const lastSyncUpdateTimestamp = new Date(+userHistory[0].syncTimestamp)
            lastSyncUpdateDate = 
                lastSyncUpdateTimestamp.toDateString() === new Date().toDateString() ?
                    lastSyncUpdateTimestamp.toLocaleTimeString(config.language) :
                    lastSyncUpdateTimestamp.toLocaleDateString(config.language ,{year: '2-digit', month: '2-digit', day: '2-digit' })
                    
            user.updatedParams.forEach(param => {
                const updateDifference = user[param] - userHistory[0][param]
                updatedParams.push(
                    <div className="syncStatsEntry" key={param}>
                        <i className="material-icons">
                            {param === 'rank'? 'equalizer' : ''}
                            {param === 'helpfulVotes'? 'thumb_up' : ''}
                            {param === 'reviewsCount'? 'create' : ''}
                            {param === 'commentsCount'? 'comment' : ''}
                        </i>
                        {(updateDifference > 0 ? '+':'')}
                        <CountUp end={updateDifference} />
                    </div>
                )
            });
        }
    }

    return(
        <div className="syncarea">
            <div className="syncButtonsWrapper">
                <div className="syncButton" onClick={() => startCrawlClickHandler()}>
                    <i className={"material-icons" + (status.isScrapingFull? ' loading' : '') }>refresh</i>
                    <span>Complete</span>
                </div>
                <div className="syncButton" onClick={() => startCrawlClickHandler({maxReviewNumber: config.maxReviewNumberOnPartScrape})}>
                    <i className={"material-icons" + (status.isScrapingPartially? ' loading' : '') }>refresh</i>
                    <span>Partially</span>
                </div>
            </div>
            <div className='syncStatus'>
                <span>Status: </span>
                <span>{status.scrapeStatus} </span>
                {status.scrapeProgress? <span>{status.scrapeProgress}%</span> : '' }
            </div>
            {
               updatedParams.length? 
               <div className="syncStats">
                   <i className="material-icons">history</i>
                   <div className="syncStatsBody">
                       <div>Updates since {lastSyncUpdateDate}</div>
                       <div className="syncStatsBodyContent">
                           {updatedParams}
                       </div>
                   </div>
               </div>
               : ''
            }
        </div>
    )
}
