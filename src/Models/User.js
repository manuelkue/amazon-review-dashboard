import {methods} from '../utilities/methods'

export class User {

    id
    profileURL
    name
    rank
    helpfulVotes
    reviewsCount
    syncTimestamp
    userHistory
    updatedParams

    constructor(id, profileURL, name = null, rank = null, helpfulVotes = null, reviewsCount = null, syncTimestamp = null, updatedParams = [], userHistory = []) {
        this.id = id
        this.profileURL = profileURL
        this.name = name
        this.rank = rank
        this.helpfulVotes = helpfulVotes
        this.reviewsCount = reviewsCount
        this.syncTimestamp = syncTimestamp
        this.updatedParams = updatedParams
        this.userHistory = userHistory
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
            let historyItem = {syncTimestamp : methods.cloneElement(this.syncTimestamp)}
            user.updatedParams.forEach(param => {
                historyItem[param] = methods.cloneElement(this[param])
                console.log("param",param, "->", methods.cloneElement(this[param]))
            })
            this.userHistory.push(historyItem);
            console.log("this.reviewHistory",this.userHistory)
            
            user.updatedParams.forEach(param => {
                this[param] = methods.cloneElement(user[param])
            })
            this.syncTimestamp = user.syncTimestamp + ''
            this.updatedParams = [...user.updatedParams]

            console.log("user", user.id, 'has updates', user.updatedParams)
        }
    }

  }