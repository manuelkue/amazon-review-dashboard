import React from "react"

export const Syncarea = ({config, startCrawlClickHandler}) => {
    return(
        <div className="syncarea">
            <div className="syncButtonsWrapper">
                <div className="syncButton" onClick={() => startCrawlClickHandler(99999)}>
                    <i className={"material-icons" + (config.isScrapingComplete? ' loading' : '') }>refresh</i>
                    <span>Complete</span>
                </div>
                <div className="syncButton" onClick={() => startCrawlClickHandler(config.maxReviewNumberOnPartScrape)}>
                    <i className={"material-icons" + (config.isScrapingPartially? ' loading' : '') }>refresh</i>
                    <span>Partially</span>
                </div>
            </div>
            <div className='syncStatus'>
                <span>Status:</span> <span>{config.scrapeStatus}</span>
            </div>
            <div className="syncStats">
                <i className="material-icons">history</i>
                <div className="syncStatsBody">
                    <div>Updates since last sync (-)</div>
                    <div className="syncStatsBodyContent">
                        <div className="syncStatsEntry">
                            <i className="material-icons">equalizer</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">thumb_up</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">create</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">comment</i>
                            -3
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
