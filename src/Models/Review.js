
export class Review {

    externalId
    userId
    syncTimestamp
    productTitle
    reviewTitle
    reviewText
    averageRating
    userRating
    helpfulVotes
    comments
    date
    reviewHistory
    updatedParams

    constructor(externalId, userId, syncTimestamp, productTitle, reviewTitle, reviewText, averageRating, userRating, helpfulVotes, comments, date, reviewHistory) {
        this.externalId = externalId
        this.userId = userId
        this.syncTimestamp = syncTimestamp
        this.productTitle = productTitle
        this.reviewTitle = reviewTitle
        this.reviewText = reviewText
        this.averageRating = averageRating
        this.userRating = userRating
        this.helpfulVotes = helpfulVotes
        this.comments = comments || 0
        this.date = date
        this.reviewHistory = reviewHistory || []
    }
    
    //Check whether a review with the same externalId has been updated, return all updated Params
    showUpdatedParams(review){
        let updatedParams = []
        if(this.externalId === review.externalId && this.syncTimestamp < review.syncTimestamp){
            console.log("foundSameReviewNewTimestamp", review)
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
        console.log("thisReview", this)
        if(this.showUpdatedParams(review)){
            review.updatedParams = this.showUpdatedParams(review)
            this.reviewHistory.push({...this});
            review.updatedParams.forEach(param => {
                this[param] = review[param]
                this.syncTimestamp = review.syncTimestamp + ''
                this.averageRating = review.averageRating + ''
                this.updatedParams = [...review.updatedParams]
            })
            console.log("review", review.externalId, 'has updates', review.updatedParams)
        }
    }

  }