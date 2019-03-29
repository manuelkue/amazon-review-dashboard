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
                    <div><span><i className="material-icons">face</i></span><span>{user.name}</span></div>
                    <div><span><i className="material-icons">equalizer</i></span> <span>{user.rank.toLocaleString()}</span></div>
                    <div><span><i className="material-icons">thumb_up</i></span> <span>{user.helpfulVotes.toLocaleString()}</span></div>
                    <div><span><i className="material-icons">assignment</i></span> <span>{user.reviewsCount.toLocaleString()}</span></div>
                </div>
        </div>
    )
}
