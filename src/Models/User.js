import {methods} from '../utilities/methods'

export class User {

    id
    profileURL
    name
    rank
    helpfulVotes
    reviewsCount
    syncTimestamp
    updatedParams
    userHistory

    constructor(id, profileURL, name, rank, helpfulVotes, reviewsCount, syncTimestamp, updatedParams = [], userHistory = []) {
        this.id = typeof id === 'string'? id : ''
        this.profileURL = typeof profileURL === 'string'? profileURL : ''
        this.name = typeof name === 'string'? name : ''
        this.rank = !isNaN(+rank)? +rank : 0
        this.helpfulVotes = !isNaN(+helpfulVotes)? +helpfulVotes : 0
        this.reviewsCount = !isNaN(+reviewsCount)? +reviewsCount : 0
        this.syncTimestamp = !isNaN(+syncTimestamp)? +syncTimestamp : 0
        this.updatedParams = Array.isArray(updatedParams)? updatedParams : []
        this.userHistory = Array.isArray(userHistory)? userHistory : []
    }
    
    //Check whether a user with the same id has been updated, return all updated Params
    showUpdatedParams(user){
        let updatedParams = []
        if(this.id === user.id && this.syncTimestamp < user.syncTimestamp){
            this.name !== user.name && updatedParams.push('name')
            this.rank !== user.rank && updatedParams.push('rank')
            this.helpfulVotes !== user.helpfulVotes && updatedParams.push('helpfulVotes')
            this.reviewsCount !== user.reviewsCount && updatedParams.push('reviewsCount')
        }
        if(updatedParams.length) {
            console.log("updatedParams", updatedParams)
            return updatedParams
        }else{
            return false
        }
    }

    saveToHistoryIfUpdated(user){
        if(this.showUpdatedParams(user).length){
            user.updatedParams = this.showUpdatedParams(user)
            let historyItem = {syncTimestamp : +methods.cloneElement(this.syncTimestamp)}
            user.updatedParams.forEach(param => {
                historyItem[param] = methods.cloneElement(this[param])
                console.log("param",param, "->", methods.cloneElement(this[param]))
            })
            this.userHistory.push(historyItem);
            console.log("this.reviewHistory",this.userHistory)
            
            user.updatedParams.forEach(param => {
                this[param] = methods.cloneElement(user[param])
            })
            this.syncTimestamp = user.syncTimestamp
            this.updatedParams = [...user.updatedParams]

            console.log("user", user.id, 'has updates', user.updatedParams)
        }
    }

  }