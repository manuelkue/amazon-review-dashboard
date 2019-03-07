import {Storage} from "./Storage";
import {Review} from "../Models/Review"

export const methods = {
    round(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    },

    cloneElement(element){
        switch(typeof element){
            case 'number': return element + 0
            case 'string': return element + ''
            case 'boolean': return !!element
            case 'number': return element + 0
            default: return null
        }
    },

    saveReviews(newReviews){
      const reviewStorage = new Storage({
        configName: 'reviews',
        defaults: {
          reviews: []
        }
      });

      let savedReviews=[]
      reviewStorage.get('reviews').forEach(r => {
        savedReviews.push(new Review(
              r.externalId,
              r.userId,
              r.syncTimestamp,
              r.productTitle,
              r.reviewTitle,
              r.reviewText,
              r.averageRating,
              r.userRating,
              r.helpfulVotes,
              r.comments,
              r.date,
              r.reviewHistory
          ))
      });

      newReviews.forEach(r => {

        r = new Review(
            r.externalId,
            'AG4PLE2SL7LDA33T24LPR3BF2K4A',
            + new Date().getTime(),
            r.product.title,
            r.title,
            r.text,
            r.product.averageRating,
            r.rating,
            r.helpfulVotes,
            0,
            r.sortTimestamp,
            []
        )

          if (savedReviews.map(rev => rev.externalId).includes(r.externalId)){
              savedReviews.find(rev => rev.externalId === r.externalId).saveToHistoryIfUpdated(r)
          }else{
              savedReviews.push(r)
            console.log("foundNew", r)
          }
      })
      console.log("savedReviews", savedReviews);

      reviewStorage.set('reviews', savedReviews)

    }
}