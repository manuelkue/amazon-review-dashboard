import React, { Component } from "react"
import ReviewItem from "./ReviewItem";

export const ReviewsList = props => {

    const reviewsComponents = props.reviews.map(review =>
        <ReviewItem key={review.id} review={review} />
    )

    return (
        <div>
            <div className="reviews-list">
                <div><span>Status:</span> <span>{props.config.scrapeStatus}</span></div>
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
                {!props.reviews.length && 
                    <div className="review-item review-notification"><span>Reviews loaded: {props.config.scrapeProgress}%</span></div>
                }
            </div>
        </div>
    )
}