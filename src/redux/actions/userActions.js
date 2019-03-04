export function updateUser (user){
    return {
        type:'UPDATE_USER',
        payload: user
    }
}
export function setUserName (user){
    return {
        type:'SET_USER_NAME',
        payload: user.name
    }
}
export function setUserRank (user){
    return {
        type:'SET_USER_RANK',
        payload: user.rank
    }
}
export function setUserHelpfulVotes (user){
    return {
        type:'SET_USER_HELPFUL_VOTES',
        payload: user.helpfulVotes
    }
}
export function setUserReviewsCount (user){
    return {
        type:'SET_USER_REVIEWS_COUNT',
        payload: user.reviewsCount
    }
}