import { Storage } from "./Storage";
import { Review } from "../Models/Review";

export const methods = {
  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  },

  sortObjectArray(array, sortForProperty, ascending = true) {
    //sortForProperty: string (defines after which object property should be sorted)
    if(sortForProperty){
      array.sort((a, b) => {
        const direction = ascending ? 1 : -1;
        return a[sortForProperty] > b[sortForProperty] ? direction : (a[sortForProperty] < b[sortForProperty] ? direction * -1 : 0);
      });
    }else{
      console.log('No sort property string specified')
      return false
    }
  },

  fetchURLData(fetchURL){
      if(fetchURL){
          try{
            let id = fetchURL.split('account.')[1].substring(0,28);
            let profileURL = 'https://' + new URL(fetchURL).hostname + '/gp/profile/amzn1.account.' + id
            let avatarURL = 'https://' + new URL(fetchURL).hostname + '/avatar/default/amzn1.account.' + id + '?square=true&max_width=460'
            if (typeof id === 'string' && id.length === 28 && profileURL){
              return {
                profileURL,
                avatarURL,
                id
              }
            }
          }catch(err){
            return false;
          }
      }
      return false;
  },

  cloneElement(element) {
    switch (typeof element) {
      case "number":
        return element + 0;
      case "string":
        return element + "";
      case "boolean":
        return !!element;
      case "number":
        return element + 0;
      default:
        return null;
    }
  },

  async saveReviews(newReviews, fetchURL) {
    const fetchStorage = new Storage({
      configName: "fetchedData",
      defaults: {
        user: {},
        reviews: []
      }
    });

    let savedReviews = [];

    fetchStorage
      .get("reviews")
      .then(reviews => {
        reviews.forEach(r => {
          savedReviews.push(
            new Review(
              r.externalId,
              r.userId,
              r.syncTimestamp,
              r.productTitle,
              r.productAsin,
              r.reviewTitle,
              r.reviewText,
              r.averageRating,
              r.userRating,
              r.helpfulVotes,
              r.comments,
              r.date,
              r.reviewHistory
            )
          );
        });
      })
      .then(async () => {
        newReviews.forEach(r => {
          //@TODO: Get real commentCount ID here
          r = new Review(
            r.externalId,
            this.fetchURLData(fetchURL).id,
            +new Date().getTime(),
            r.product.title,
            r.product.asin,
            r.title,
            r.text,
            r.product.averageRating,
            r.rating,
            r.helpfulVotes,
            0,
            r.sortTimestamp,
            []
          );
          if (savedReviews.map(rev => rev.externalId).includes(r.externalId)) {
            savedReviews
              .find(rev => rev.externalId === r.externalId)
              .saveToHistoryIfUpdated(r);
          } else {
            savedReviews.push(r);
            console.log("foundNew", r);
          }
        });
        console.log("savedReviews", savedReviews.length);

        await fetchStorage.set("reviews", savedReviews);
      })
      .catch(err => console.log("Tried to read saved reviews. No available"));
  }
};
