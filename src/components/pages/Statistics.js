import React from "react"

export const Statistics = ({config, status, reviews, users})  => {

    return (
            <div className="history">
                <h1>Statistics</h1>
                ReviewsCount: {reviews.length}
            </div>
    )
}