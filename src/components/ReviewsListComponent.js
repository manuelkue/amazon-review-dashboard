import React, { Component } from "react"
import reviewsData from "../data/Reviews";
import ReviewItemComponent from "./ReviewItemComponent";
import { ReviewInterface, ReviewsListInterface } from "../Interfaces/interfaces";

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
