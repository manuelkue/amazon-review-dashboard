import React from "react"
import { Storage, reviewStorage, userStorage } from "./Storage";
import { Review } from "../Models/Review";
import { User } from "../Models/User";

export const methods = {
  round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  },

  sortArray(array, sortForProperty = null, ascending = true) {
    // Function that can sort either an array of strings/numbers or an array of objects by one of the objects' properties
    // Directly modifies the array -> does not create a new array

    // sortForProperty: string (defines by which object property should be sorted)
    // ascending: boolean (defines in which order should be sorted)

    const direction = ascending ? 1 : -1;

    if(sortForProperty && array.every(item => typeof item === 'object')){
      if(array.every(item => item.hasOwnProperty(sortForProperty))){
        array.sort((a, b) => {
          return a[sortForProperty] > b[sortForProperty] ? direction : (a[sortForProperty] < b[sortForProperty] ? direction * -1 : 0);
        });
      }else{
        console.error('Specified property not found in objects Array. Returned in current sort order')
      }
    }else{
      array.sort((a, b) => {
        return a > b ? direction : (a < b ? direction * -1 : 0);
      });
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

  findFirstIdOfTarget(target){
    // Method that searches recursively for a parent element that has an id.
    // Used for onClick-methods that need an id
    if (target && target.id && target.id.length !== 0) return target.id
    if (!target.parentElement) return ''
    return this.findFirstIdOfTarget(target.parentElement)
  },

  arr2ReviewClassArr(reviewObjArray){
    let reviewObjects = []
    // @TODO: Comments can be removed, if function is no longer needed:
    // To remove all single syncTimestamps from older times when each review got its own syncTimestamp while syncing, following function smoothens available timestamps
    // After doing this the reviews have to be saved one time (eg update reviews partially) and alle smoothed timestamps are saved to disk as well.
    // const collectedTimestamps = reviewObjArray.map(review2 => review2.syncTimestamp);
    reviewObjArray.forEach(review => {
      // if(collectedTimestamps.some(timestamp => (review.syncTimestamp >= (timestamp - 60000)) && (review.syncTimestamp <= (timestamp + 60000)))){
      //   review.syncTimestamp = collectedTimestamps.find(timestamp => (review.syncTimestamp >= (timestamp - 60000)) && (review.syncTimestamp <= (timestamp + 60000)));
      // }
      reviewObjects.push(Object.assign(new Review({}), review))
    })
    return reviewObjects;
  },

  saveReviews(newReviews, currentReviews, fetchURL, reviewsAlreadyReviewObjects = false) {
    return new Promise(async (resolve, reject) => {

      let savedReviews = [...currentReviews];
      console.log("currentReviews", [...currentReviews]);

      // Create Timestamp here to give every review that's synced together the same timestamp
      const syncTimestamp = +new Date().getTime();

      newReviews.forEach(r => {

        if(!reviewsAlreadyReviewObjects){
          //@TODO: Get real commentCount ID here
          r = new Review({
            externalId: r.externalId,
            userId: this.fetchURLData(fetchURL).id,
            syncTimestamp: syncTimestamp,
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
        }else{
          r = {
            ...r,
            syncTimestamp: syncTimestamp
          }
        }

        if (savedReviews.map(rev => rev.externalId).includes(r.externalId)) {
          try{
            console.log('found in savedReviews :', savedReviews.find(rev => rev.externalId === r.externalId));
            savedReviews
              .find(rev => rev.externalId === r.externalId)
              .saveToHistoryIfUpdated(r, reviewsAlreadyReviewObjects);
          }
          catch (err){
            console.log("Error at review", savedReviews.find(rev => rev.externalId === r.externalId));
            console.log(err);
          }
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
              '',
              0,
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
