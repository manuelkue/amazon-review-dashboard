import React, { Component } from "react"
import reviewsData from "../data/Reviews";
import ReviewItemComponent from "./ReviewItemComponent";

class ReviewsListComponent extends Component{
    constructor() {
        super()
        this.state = {
            reviewsBy: "Manuel"
        }
    }

    render() {
        const reviewsComponents = reviewsData.map(review =>
            <ReviewItemComponent key={review.id} review={review} />
        )

        return (
            <div className="reviews-list">
                <p>Reviews of {this.state.reviewsBy}</p>
                <form>
                    {reviewsComponents}
                </form>
            </div>
        )
    }
}

export default ReviewsListComponent
