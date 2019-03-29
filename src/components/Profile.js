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
                    <div><span><i className="material-icons">face</i></span><span>{user.name}</span></div>
                    <div><span><i className="material-icons">equalizer</i></span> <span>{user.rank.toLocaleString()}</span></div>
                    <div><span><i className="material-icons">thumb_up</i></span> <span>{user.helpfulVotes.toLocaleString()}</span></div>
                    <div><span><i className="material-icons">assignment</i></span> <span>{user.reviewsCount.toLocaleString()}</span></div>
                </div>
                :
                <div className="notification"><div>No user profile provided.</div></div>
            }
        </div>
    )
}
