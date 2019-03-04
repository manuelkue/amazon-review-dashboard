export function updateScrapeStatus (status){
    return {
        type:'UPDATE_SCRAPE_STATUS',
        payload: status
    }
}

export function updateScrapeProgress (progress){
    return {
        type:'UPDATE_SCRAPE_PROGRESS',
        payload: progress
    }
}