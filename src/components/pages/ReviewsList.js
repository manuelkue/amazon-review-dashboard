import React from "react"
import ReviewItem from "../ReviewItem";

import {methods} from "../../utilities/methods";
import { ProgressBar } from "../progressBar";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export const ReviewsList = ({reviews, config, status})  => {

    if(methods.fetchURLData(config.fetchURL)){
        methods.sortObjectArray(reviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = reviews.filter(review => config.fetchURL.includes(review.userId))
            .map(review => 
                <ReviewItem key={review.externalId} review={review} />
            )
            
        return (
            <div className="reviews-list">
                <h1>Reviews</h1>
                <div className="review-item reviews-header">
                    <div>External Id</div>
                    <div>Product Title</div>
                    <div>Review Title</div>
                    <div>Average Rating</div>
                    <div>Your Rating</div>
                    <div>Helpful Votes</div>
                    <div>Datum</div>
                </div>
                <ProgressBar progress={status.scrapeProgress}></ProgressBar>
                {reviewsComponents}
                {!reviewsComponents.length && 
                    <div className="review-item review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                }
            </div>
        )
    }else{
        return (
            <div className="reviews-list">
                <h1>Reviews</h1>
                <div className="review-item review-notification"><span>Please specify a URL in the settings that should be used for fetching review data.</span></div>
            </div>
        )
    }

}