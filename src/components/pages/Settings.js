import React from "react"

export const Settings = ({config, status, saveNewPartialCrawlNumber})  => {

    return (
        <div className="settings">
            <h1>Settings</h1>
            <label>
                Partial Crawling  {status.crawlNumberValid?'':'- Please enter a number'}<br />
                <input className={status.fetchURLValid?'':'invalid'} placeholder='Number of reviews that are fetched with a partial Crawl' type="number" value={config.maxReviewNumberOnPartScrape} onChange={saveNewPartialCrawlNumber} ></input>
            </label>
        </div>
    )
}