import {methods} from '../utilities/methods'

export class Review {

    externalId
    userId
    syncTimestamp
    productTitle
    productAsin
    productMissing
    verifiedPurchase
    vine
    reviewTitle
    reviewText
    averageRating
    reviewCount
    userRating
    helpfulVotes
    comments
    date
    updatedParams
    reviewHistory

    selected

    constructor({
        externalId = undefined,
        userId,
        syncTimestamp,
        productTitle,
        productAsin,
        productMissing,
        verifiedPurchase,
        vine,
        reviewTitle,
        reviewText,
        averageRating,
        reviewCount,
        userRating,
        helpfulVotes,
        comments,
        date,
        updatedParams,
        reviewHistory
    }) {
        this.externalId = typeof externalId === 'string'? externalId : ''
        this.userId = typeof userId === 'string'? userId : ''
        this.syncTimestamp = !isNaN(syncTimestamp)? syncTimestamp : 0
        this.productTitle = typeof productTitle === 'string'? productTitle : ''
        this.productAsin =  typeof productAsin === 'string'? productAsin : ''
        this.productMissing = typeof productMissing === 'boolean'? productMissing : false
        this.verifiedPurchase = typeof verifiedPurchase === 'boolean'? verifiedPurchase : false
        this.vine = typeof vine === 'boolean'? vine : false
        this.reviewTitle = typeof reviewTitle === 'string'? reviewTitle : ''
        this.reviewText = typeof reviewText === 'string'? reviewText : ''
        this.averageRating = !isNaN(averageRating)? averageRating : 0
        this.reviewCount = !isNaN(reviewCount)? reviewCount : 0
        this.userRating = !isNaN(userRating)? userRating : 0
        this.helpfulVotes = !isNaN(helpfulVotes)? helpfulVotes : 0
        this.comments = !isNaN(comments)? comments : 0
        this.date = !isNaN(date)? date : 0
        this.updatedParams = updatedParams
        this.reviewHistory = reviewHistory || []
    }
    
    //Check whether a review with the same externalId has been updated, return all updated Params
    showUpdatedParams(review, reviewsAlreadyReviewObjects){
        let updatedParams = []
        if(this.externalId === review.externalId && +this.syncTimestamp < +review.syncTimestamp){
            this.productTitle !== review.productTitle && updatedParams.push('productTitle')
            this.productMissing !== review.productMissing && updatedParams.push('productMissing')
            this.reviewTitle  !== review.reviewTitle && updatedParams.push('reviewTitle')
            this.reviewText !== review.reviewText && updatedParams.push('reviewText')
            this.reviewCount !== review.reviewCount && updatedParams.push('reviewCount')
            this.userRating !== review.userRating && updatedParams.push('userRating')
            this.helpfulVotes !== review.helpfulVotes && updatedParams.push('helpfulVotes')
            this.comments !== review.comments && reviewsAlreadyReviewObjects && updatedParams.push('comments')
        }
        if(updatedParams.length) {
            console.log("updatedParams", updatedParams)
            return updatedParams
        }else{
            return false
        }
    }

    saveToHistoryIfUpdated(review, reviewsAlreadyReviewObjects){
        if(this.showUpdatedParams(review, reviewsAlreadyReviewObjects)){
            review.updatedParams = this.showUpdatedParams(review, reviewsAlreadyReviewObjects)
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
            this.reviewCount = review.reviewCount + 0
            this.updatedParams = [...review.updatedParams]

            console.log("review", review.externalId, 'has updates', review.updatedParams)
        }
    }

  }