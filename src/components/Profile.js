import React, {Component} from "react"

export const Profile = props => {
    return(
        <div className="profile">
            <div><span>Name:</span> <span>{props.user.name}</span></div>
            <div><span>Rank:</span> <span>{props.user.rank}</span></div>
            <div><span>Helpful votes:</span> <span>{props.user.helpfulVotes}</span></div>
            <div><span>Reviews:</span> <span>{props.user.reviewsCount}</span></div>
        </div>
    )
}
