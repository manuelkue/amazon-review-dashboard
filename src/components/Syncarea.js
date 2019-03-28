import React from "react"
import CountUp from 'react-countup';

export const Syncarea = ({user, config, status, startCrawlClickHandler}) => {

    let updatedParams = [];
    let lastSyncUpdateDate = 'never'

    if (user){
        console.log('user :', user);
        if(user.updatedParams.length){
            const lastSyncUpdateTimestamp = new Date(user.userHistory[user.userHistory.length - 1].syncTimestamp)
            lastSyncUpdateDate = lastSyncUpdateTimestamp.toDateString() === new Date().toDateString() ? lastSyncUpdateTimestamp.toLocaleTimeString() : lastSyncUpdateTimestamp.toLocaleDateString()
            user.updatedParams.forEach(param => {
                const updateDifference = user[param] - user.userHistory[user.userHistory.length - 1][param]
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
            console.log('updatedParams :', updatedParams);
        }
    }

    return(
        <div className="syncarea">
            <div className="syncButtonsWrapper">
                <div className="syncButton" onClick={() => startCrawlClickHandler(99999)}>
                    <i className={"material-icons" + (status.isScrapingComplete? ' loading' : '') }>refresh</i>
                    <span>Complete</span>
                </div>
                <div className="syncButton" onClick={() => startCrawlClickHandler(config.maxReviewNumberOnPartScrape)}>
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
