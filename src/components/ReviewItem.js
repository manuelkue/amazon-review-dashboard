import React, {Component} from "react"

export const ReviewItem = props => {

    return(
        <div className="review-item">
            <div>{props.review.externalId}</div>
            <div>{props.review.product.title || <i>not available anymore</i>}</div>
            <div>{props.review.title}</div>
            <div>{props.review.product.averageRating}</div>
            <div>{props.review.rating}</div>
            <div>{props.review.helpfulVotes}</div>
            <div>{new Date(props.review.sortTimestamp).toLocaleDateString()}</div>
        </div>
    )
}

export default ReviewItem
