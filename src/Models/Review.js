import {methods} from '../utilities/methods'

export class Review {

    externalId
    userId
    syncTimestamp
    productTitle
    productAsin
    reviewTitle
    reviewText
    averageRating
    userRating
    helpfulVotes
    comments
    date
    updatedParams
    reviewHistory

    //@TODO: Add parameter "deleted", aber ermögliche, diesen bei einem nächsten Sync wieder zu entfernen, falls fehlerhafte Anzeige

    selected

    constructor(externalId, userId, syncTimestamp, productTitle, productAsin, reviewTitle, reviewText, averageRating, userRating, helpfulVotes, comments, date, updatedParams, reviewHistory) {
        this.externalId = externalId
        this.userId = userId
        this.syncTimestamp = syncTimestamp
        this.productTitle = productTitle
        this.productAsin = productAsin
        this.reviewTitle = reviewTitle
        this.reviewText = reviewText
        this.averageRating = averageRating
        this.userRating = userRating
        this.helpfulVotes = helpfulVotes
        this.comments = comments || 0
        this.date = date
        this.updatedParams = updatedParams
        this.reviewHistory = reviewHistory || []
    }
    
    //Check whether a review with the same externalId has been updated, return all updated Params
    showUpdatedParams(review){
        let updatedParams = []
        if(this.externalId === review.externalId && this.syncTimestamp < review.syncTimestamp){
            this.productTitle !== review.productTitle && updatedParams.push('productTitle')
            this.reviewTitle  !== review.reviewTitle && updatedParams.push('reviewTitle')
            this.reviewText !== review.reviewText && updatedParams.push('reviewText')
            this.userRating !== review.userRating && updatedParams.push('userRating')
            this.helpfulVotes !== review.helpfulVotes && updatedParams.push('helpfulVotes')
            this.comments !== review.comments && updatedParams.push('comments')
        }
        if(updatedParams.length) {
            console.log("updatedParams", updatedParams)
            return updatedParams
        }else{
            return false
        }
    }

    saveToHistoryIfUpdated(review){
        if(this.showUpdatedParams(review)){
            review.updatedParams = this.showUpdatedParams(review)
            let historyItem = {syncTimestamp : methods.cloneElement(this.syncTimestamp)}
            review.updatedParams.forEach(param => {
                historyItem[param] = methods.cloneElement(this[param])
            })
            historyItem.updatedParams = [...this.updatedParams]
            this.reviewHistory.push(historyItem);
            
            review.updatedParams.forEach(param => {
                this[param] = methods.cloneElement(review[param])
            })
            this.syncTimestamp = review.syncTimestamp + ''
            this.averageRating = review.averageRating + ''
            this.updatedParams = [...review.updatedParams]

            console.log("review", review.externalId, 'has updates', review.updatedParams)
        }
    }

  }