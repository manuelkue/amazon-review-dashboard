import React from "react"

const Settings = ({config, status, settingsFunctions, crawlCommentsCounts})  => {

    const availableLanguages = config.languagesAvailable
        .map(language =>
            <div className={"button" + (config.language === language.short ? ' selected' : '')} key={language.short} onClick={() => settingsFunctions.saveLanguage(language)}>{language.long}</div>
        )

    return (
        <div className="settings">
            <h1>Settings</h1>
            <div className = "inputHeading">
                Partial Crawling  {status.crawlNumberValid?'':'- Please enter a number'}
            </div>
            <input
                className={status.fetchURLValid?'':'invalid'}
                placeholder='Number of reviews that are fetched with a partial Crawl'
                type="number"
                value={config.maxReviewNumberOnPartScrape}
                onChange={settingsFunctions.saveNewPartialCrawlNumber}
            />
            <div className = "inputHeading">
                Language
            </div>
            <div className="languagesWrapper">
                {availableLanguages}
            </div>
            <div className = "inputHeading">
                Manual Comments Crawl
            </div>
            <div className="languagesWrapper">
                <div className="button" onClick={() => crawlCommentsCounts()}>Start Crawl of all reviews</div>
            </div>
        </div>
    )
}

export default Settings;