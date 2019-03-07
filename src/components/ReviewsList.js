import React from "react"
import ReviewItem from "./ReviewItem";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

export const ReviewsList = ({reviews, config})  => {

    //@TODO: Only show if review.userId === config.userId
    const reviewsComponents = reviews.filter(review => config.userURL.includes(review.userId))
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
}