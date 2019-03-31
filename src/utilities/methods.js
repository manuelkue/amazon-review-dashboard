import React from "react"
import { Storage, reviewStorage, userStorage } from "./Storage";
import { Review } from "../Models/Review";
import { User } from "../Models/User";

export const methods = {
  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  },

  sortObjectArray(array, sortForProperty, ascending = true) {
    //sortForProperty: string (defines by which object property should be sorted)
    if(sortForProperty){
      array.sort((a, b) => {
        const direction = ascending ? 1 : -1;
        return a[sortForProperty] > b[sortForProperty] ? direction : (a[sortForProperty] < b[sortForProperty] ? direction * -1 : 0);
      });
    }else{
      console.log('No sort property string specified')
    }
    return array;
  },

  fetchURLData(fetchURL){
      if(fetchURL){
          try{
            let id = fetchURL.split('account.')[1].substring(0,28);
            let profileURL = 'https://' + new URL(fetchURL).hostname + '/gp/profile/amzn1.account.' + id
            let avatarURL = 'https://' + new URL(fetchURL).hostname + '/avatar/default/amzn1.account.' + id + '?square=true&max_width=460'
            let reviewBaseURL = 'https://' + new URL(fetchURL).hostname + '/gp/customer-reviews/'
            if (typeof id === 'string' && id.length === 28 && profileURL){
              return {
                profileURL,
                avatarURL,
                reviewBaseURL,
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

  arr2ReviewClassArr(reviewObjArray){
    let reviewObjects = []
    reviewObjArray.forEach(review => reviewObjects.push(Object.assign(new Review({}), review)))
    return reviewObjects;
  },

  saveReviews(newReviews, currentReviews, fetchURL) {
    return new Promise(async (resolve, reject) => {

      let savedReviews = [...currentReviews];
      console.log("currentReviews", [...currentReviews]);

      newReviews.forEach(r => {
        //@TODO: Get real commentCount ID here
        r = new Review({
          externalId: r.externalId,
          userId: this.fetchURLData(fetchURL).id,
          syncTimestamp: +new Date().getTime(),
          productTitle: r.product.title,
          productAsin: r.product.asin,
          productMissing: r.product.missing,
          verifiedPurchase: r.verifiedPurchase,
          vine: r.vine,
          reviewTitle: r.title,
          reviewText: r.text,
          averageRating: +r.product.averageRating,
          userRating: +r.rating,
          helpfulVotes: +r.helpfulVotes,
          comments: 0,
          date: +r.sortTimestamp,
          updatedParams: [],
          reviewHistory: []
        });
        if (savedReviews.map(rev => rev.externalId).includes(r.externalId)) {
          savedReviews
            .find(rev => rev.externalId === r.externalId)
            .saveToHistoryIfUpdated(r);
        } else {
          savedReviews.push(r);
          console.log("foundNew", r);
        }
      });
      console.log("currentReviews-including-new-reviews", savedReviews);

      await reviewStorage.set("reviews", savedReviews);
      resolve(true)
    })
  },

  arr2UserClassArr(userObjArray){
    let userObjects = []
    userObjArray.forEach(user => userObjects.push(Object.assign(new User, user)))
    return userObjects;
  },

  saveUser(newUser, currentUsers) {
    return new Promise(async (resolve, reject) => {
      console.log('newUser :', newUser);

      if(this.fetchURLData(newUser.userProfileURL)){
        let savedUsers = [...currentUsers];
        console.log("currentUsers",savedUsers)
          const u = new User(
              this.fetchURLData(newUser.userProfileURL).id,
              this.fetchURLData(newUser.userProfileURL).profileURL,
              newUser.name,
              newUser.rank,
              newUser.helpfulVotes,
              newUser.reviewsCount,
              +new Date().getTime(),
              [],
              []
          );
          if (savedUsers.map(user => user.id).includes(this.fetchURLData(newUser.userProfileURL).id)) {
              savedUsers
              .find(user => user.id === this.fetchURLData(newUser.userProfileURL).id)
              .saveToHistoryIfUpdated(u);
          } else {
              savedUsers.push(u);
              console.log("foundNew", u);
          }
          console.log("new savedUsers", savedUsers);
  
          await userStorage.set("users", savedUsers);
          resolve(true)
      }else{
        console.error("Error saving user", this.fetchURLData(newUser.userProfileURL));
        reject('Error while saving user')
      }

    })
  },

  getProductTitle(review){
    let formerProductTitle = <span className="productDeleted">not available anymore</span>

    if(!review.productTitle && review.reviewHistory.find(historyItem => historyItem.productTitle)){
        formerProductTitle = <span className="productDeleted">{review.reviewHistory.find(historyItem => historyItem.productTitle).productTitle}</span>
    }
    return review.productTitle || formerProductTitle;
  }
};
