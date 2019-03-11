import { Storage, reviewStorage, userStorage } from "./Storage";
import { Review } from "../Models/Review";
import { User } from "../Models/User";

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
      case "object":
        return Array.isArray(element)? [...element]: Object.assign({}, element);
      default:
        return null;
    }
  },

  saveReviews(newReviews, fetchURL) {
    return new Promise(async (resolve, reject) => {
      let savedReviews = [];

      reviewStorage
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
                r.updatedParams,
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
              [],
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

          await reviewStorage.set("reviews", savedReviews);
          resolve(true)
        })
        .catch(err => {
          console.log("Tried to read saved reviews. No available")
          reject(err)
        });
    })
  },

  saveUser(newUser, fetchURL) {
    return new Promise(async (resolve, reject) => {

      let savedUsers = [];

      userStorage
        .get("users")
        .then(users => {
          users.forEach(u => {
              savedUsers.push(
              new User(
                  u.id,
                  u.name,
                  u.rank,
                  u.helpfulVotes,
                  u.reviewsCount,
                  u.syncTimestamp,
                  u.updatedParams,
                  u.userHistory
              )
            );
          });
          console.log("bisherige User im storage", users)
          console.log("bisherige User als User-Objects", savedUsers)
        })
        .then(async () => {
          const u = new User(
              this.fetchURLData(fetchURL).id,
              newUser.name,
              newUser.rank,
              newUser.helpfulVotes,
              newUser.reviewsCount,
              +new Date().getTime(),
              [],
              []
          );
          if (savedUsers.map(user => user.id).includes(this.fetchURLData(fetchURL).id)) {
              savedUsers
              .find(user => user.id === this.fetchURLData(fetchURL).id)
              .saveToHistoryIfUpdated(u);
          } else {
              savedUsers.push(u);
              console.log("foundNew", u);
          }
          console.log("savedUsers", savedUsers.length);
  
          await userStorage.set("users", savedUsers);
          resolve(true)
        })
        .catch(err => {
          console.log("Tried to read saved users. No available")
          reject(err)
        });
    })

  }
};
