import React from "react"

export const Settings = ({config, status, settingsFunctions})  => {

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
        </div>
    )
}