import { Storage } from "./Storage";
import { Review } from "../Models/Review";

export const methods = {
  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  },

  fetchURLData(fetchURL){
      if(fetchURL){
        let id = fetchURL.split('account.')[1].substring(0,28);
        let url = 'https://' + new URL(fetchURL).hostname + '/gp/profile/amzn1.account.' + id
        if (typeof id === 'string' && id.length === 28 && url){
          return {
                  url: url,
                  id: id
              }
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
          //@TODO: Get User ID here
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
        console.log("savedReviews", savedReviews);

        await fetchStorage.set("reviews", savedReviews);
      })
      .catch(err => console.log("Tried to read saved reviews. No available"));
  }
};
