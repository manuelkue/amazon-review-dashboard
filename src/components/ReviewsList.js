import React from "react"
import ReviewItem from "./ReviewItem";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

export const ReviewsList = ({reviews, config})  => {

    const reviewsComponents = reviews.map(review =>
        <ReviewItem key={review.id} review={review} />
    )

    return (
        <div>
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
                {reviewsComponents}
                {!reviews.length && 
                    <div className="review-item review-notification"><span>Reviews loaded: {config.scrapeProgress}%</span></div>
                }
            </div>
        </div>
    )
}