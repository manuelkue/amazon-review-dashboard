import React from "react"
import profilePicture from "../assets/images/profile.jpg"
import rankPicture from "../assets/images/baseline-equalizer-24px.svg"
import helpfulVotesPicture from "../assets/images/baseline-thumb_up-24px.svg"
import reviewPicture from "../assets/images/baseline-insert_drive_file-24px.svg"

export const Profile = ({user}) => {
    return(
        <div className="profile">
            <div className="picturewrapper">
                <img src={profilePicture} />
            </div>
            <div className="stats">
                <div><span><i className="material-icons">face</i></span><span>{user.name}</span></div>
                <div><span><i className="material-icons">equalizer</i></span> <span>{user.rank}</span></div>
                <div><span><i className="material-icons">thumb_up</i></span> <span>{user.helpfulVotes}</span></div>
                <div><span><i className="material-icons">create</i></span> <span>{user.reviewsCount}</span></div>
            </div>
        </div>
    )
}
