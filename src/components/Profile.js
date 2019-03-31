import React from "react"
import {methods} from '../utilities/methods'

export const Profile = ({user, config}) => {
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className="profile">
            <div className="picturewrapper">
                <img src={config ? (methods.fetchURLData(config.fetchURL).avatarURL) : ''} />
            </div>
            {user?
                <div className="stats">
                    <div><span className="material-icons">face</span><span className="truncateString">{user.name}</span></div>
                    <div><span className="material-icons">equalizer</span> <span className="truncateString">{user.rank.toLocaleString()}</span></div>
                    <div><span className="material-icons">thumb_up</span> <span className="truncateString">{user.helpfulVotes.toLocaleString()}</span></div>
                    <div><span className="material-icons">assignment</span> <span className="truncateString">{user.reviewsCount.toLocaleString()}</span></div>
                </div>
                :
                <div className="notification"><div>No user profile provided.</div></div>
            }
        </div>
    )
}
