const initialReviewsState = {
    reviews: []
}
const reviewsReducer = (state = initialReviewsState, action) => {
    switch (action.type){
        case 'UPDATE_REVIEWS':
            return {
                ...state, reviews: action.payload
            }
        default: return state;
    }
}

export default reviewsReducer