const initialUserState = {
    name: 'Manuel Küfeldt',
    rank: '',
    helpfulVotes: 0,
    reviewsCount: 0
}
const userReducer = (state = initialUserState, action) => {
    switch (action.type){
        case 'UPDATE_USER':
            return  action.payload
        case 'SET_USER_NAME':
            return {
                ...state, name: action.payload
            }
        case 'SET_USER_RANK':
            return {
                ...state, rank: action.payload
            }
        case 'SET_USER_HELPFUL_VOTES':
            return {
                ...state, helpfulVotes: action.payload
            }
        case 'SET_USER_REVIEWS_COUNT':
            return {
                ...state, reviewsCount: action.payload
            }
        default: return state;
    }
}

export default userReducer