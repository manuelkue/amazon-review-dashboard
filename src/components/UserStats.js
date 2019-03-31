import React from "react"

export const UserStats = ({user}) => {
    return(
        <div className="userStats">
            <div><span className="material-icons">face</span><span>{user.name}</span></div>
            <div><span className="material-icons">equalizer</span> <span>{user.rank.toLocaleString()}</span></div>
            <div><span className="material-icons">thumb_up</span> <span>{user.helpfulVotes.toLocaleString()}</span></div>
            <div><span className="material-icons">assignment</span> <span>{user.reviewsCount.toLocaleString()}</span></div>
        </div>
    )
}
