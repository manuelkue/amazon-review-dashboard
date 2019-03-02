import React, { Component } from "react"
import reviewsData from "../data/Reviews";
import ReviewItemComponent from "./ReviewItemComponent";

class ReviewsListComponent extends Component{
    constructor() {
        super()
        this.state = {
            reviewsBy: "Manuel",
            helpfulVotes: "1.400"
        }
    }

    render() {
        const reviewsComponents = reviewsData.map(review =>
            <ReviewItemComponent key={review.id} review={review} />
        )

        return (
            <div className="reviews-list">
                <p>Reviews of {this.state.reviewsBy}</p>
                <p>Helpful votes {this.state.helpfulVotes}</p>
                <form>
                    {reviewsComponents}
                </form>
            </div>
        )
    }
}

export default ReviewsListComponent
