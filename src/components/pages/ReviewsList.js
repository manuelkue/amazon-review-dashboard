import React from "react"
import ReviewItem from "../ReviewItem";

import {methods} from "../../utilities/methods";
import { ProgressBar } from "../progressBar";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export const ReviewsList = ({reviews, config, status, reviewFunctions})  => {

    if(methods.fetchURLData(config.fetchURL)){
        let filteredReviews = [...reviews.filter(review => config.fetchURL.includes(review.userId))]
        methods.sortObjectArray(filteredReviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = [...filteredReviews]
            .map(review => 
                <ReviewItem key={review.externalId} review={review} reviewFunctions={reviewFunctions} />
            )
            
        return (
            <div className="reviews-list">
                <h1>Reviews</h1>
                <div className="reviewItem reviewsHeader">
                    <div><i className="material-icons">open_in_new</i></div>
                    <div>Product</div>
                    <div>Review Title</div>
                    <div><i className="material-icons" style={{fontSize : '16px'}}>star_half</i></div>
                    <div><i className="material-icons" style={{fontSize : '16px'}}>star</i></div>
                    <div><i className="material-icons" style={{fontSize : '16px'}}>thumb_up</i></div>
                    <div>Date</div>
                </div>
                <ProgressBar progress={status.scrapeProgress}></ProgressBar>
                <div className="reviewItemsWrapper">
                    {reviewsComponents}
                    {!reviewsComponents.length && 
                        <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                    }
                </div>
            </div>
        )
    }else{
        return (
            <div className="reviews-list">
                <h1>Reviews</h1>
                <div className="reviewItem review-notification"><span>Please specify a URL in the user area that should be used for fetching review data.</span></div>
            </div>
        )
    }

}