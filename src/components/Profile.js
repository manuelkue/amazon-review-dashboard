import React from "react"
import {methods} from '../utilities/methods'
import { UserStats } from "./UserStats";

export const Profile = ({user, config}) => {
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className="profile">
            <div className="picturewrapper">
                <img src={config ? (methods.fetchURLData(config.fetchURL).avatarURL) : ''} />
            </div>
            {user?
                <UserStats config={config} user={user} />
                :
                <div className="notification"><div>No user profile provided.</div></div>
            }
        </div>
    )
}
