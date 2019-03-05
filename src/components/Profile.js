import React from "react"

export const Profile = ({user}) => {
    return(
        <div className="profile">
            <div><span>Name:</span> <span>{user.name}</span></div>
            <div><span>Rank:</span> <span>{user.rank}</span></div>
            <div><span>Helpful votes:</span> <span>{user.helpfulVotes}</span></div>
            <div><span>Reviews:</span> <span>{user.reviewsCount}</span></div>
        </div>
    )
}
