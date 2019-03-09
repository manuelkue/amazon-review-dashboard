import React from "react"
import ReviewItem from "./ReviewItem";

import {methods} from "../utilities/methods";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export const ReviewsList = ({reviews, config})  => {

    if(methods.fetchURLData(config.fetchURL)){
        methods.sortObjectArray(reviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = reviews.filter(review => config.fetchURL.includes(review.userId))
            .map(review => 
                <ReviewItem key={review.externalId} review={review} />
            )
            
        return (
            <div className="reviews-list">
                <div className="review-item reviews-header">
                    <div>External Id</div>
                    <div>Product Title</div>
                    <div>Review Title</div>
                    <div>Average Rating</div>
                    <div>Your Rating</div>
                    <div>Helpful Votes</div>
                    <div>Datum</div>
                </div>
                <div style={{display: 'block', height:5+'px', background: 'var(--color-secondary)', width: config.scrapeProgress + '%'}}></div>
                {reviewsComponents}
                {!reviewsComponents.length && 
                    <div className="review-item review-notification"><span>Reviews loaded: {config.scrapeProgress}%</span></div>
                }
            </div>
        )
    }else{
        return (
            <div className="reviews-list">
                <div className="review-item review-notification"><span>Please specify a URL in the settings that should be used for fetching review data.</span></div>
            </div>
        )
    }

}