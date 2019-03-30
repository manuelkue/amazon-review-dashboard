import {methods} from '../utilities/methods'

export class Review {

    externalId
    userId
    syncTimestamp
    productTitle
    productAsin
    verifiedPurchase
    vine
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

    constructor(externalId, userId, syncTimestamp, productTitle, productAsin, verifiedPurchase, vine, reviewTitle, reviewText, averageRating, userRating, helpfulVotes, comments, date, updatedParams, reviewHistory) {
        this.externalId = typeof externalId === 'string'? externalId : ''
        this.userId = typeof userId === 'string'? userId : ''
        this.syncTimestamp = !isNaN(syncTimestamp)? syncTimestamp : 0
        this.productTitle = typeof productTitle === 'string'? productTitle : ''
        this.productAsin =  typeof productAsin === 'string'? productAsin : ''
        this.verifiedPurchase = typeof verifiedPurchase === 'boolean'? verifiedPurchase : false
        this.vine = typeof vine === 'boolean'? vine : false
        this.reviewTitle = typeof reviewTitle === 'string'? reviewTitle : ''
        this.reviewText = typeof reviewText === 'string'? reviewText : ''
        this.averageRating = !isNaN(averageRating)? averageRating : 0
        this.userRating = !isNaN(userRating)? userRating : 0
        this.helpfulVotes = !isNaN(helpfulVotes)? helpfulVotes : 0
        this.comments = !isNaN(comments)? comments : 0
        this.date = !isNaN(date)? date : 0
        this.updatedParams = updatedParams
        this.reviewHistory = reviewHistory || []
    }
    
    //Check whether a review with the same externalId has been updated, return all updated Params
    showUpdatedParams(review){
        let updatedParams = []
        if(this.externalId === review.externalId && +this.syncTimestamp < +review.syncTimestamp){
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
            let historyItem = {syncTimestamp : methods.cloneElement(+this.syncTimestamp)}
            review.updatedParams.forEach(param => {
                historyItem[param] = methods.cloneElement(this[param])
            })
            historyItem.updatedParams = [...this.updatedParams]
            this.reviewHistory = [historyItem, ...this.reviewHistory];
            
            review.updatedParams.forEach(param => {
                this[param] = methods.cloneElement(review[param])
            })
            this.syncTimestamp = +review.syncTimestamp
            this.averageRating = review.averageRating + 0
            this.updatedParams = [...review.updatedParams]

            console.log("review", review.externalId, 'has updates', review.updatedParams)
        }
    }

  }