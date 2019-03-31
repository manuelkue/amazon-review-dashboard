import React from "react"
import {methods} from '../utilities/methods'

export const UserCard = ({user, selectUser, config}) => {
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className={"profile card" + (config.fetchURL.includes(user.id)? ' selected':' selectable')} onClick={() => selectUser(user)}>
            <div className="picturewrapper">
                <img src={methods.fetchURLData(user.profileURL).avatarURL} />
            </div>
                <div className="stats">
                    <div><span className="material-icons">face</span><span>{user.name}</span></div>
                    <div><span className="material-icons">equalizer</span> <span>{user.rank.toLocaleString()}</span></div>
                    <div><span className="material-icons">thumb_up</span> <span>{user.helpfulVotes.toLocaleString()}</span></div>
                    <div><span className="material-icons">assignment</span> <span>{user.reviewsCount.toLocaleString()}</span></div>
                </div>
        </div>
    )
}
