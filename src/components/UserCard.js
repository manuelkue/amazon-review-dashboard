import React from "react"
import {methods} from '../utilities/methods'
import { UserStats } from "./UserStats";

export const UserCard = ({user, selectUser, config}) => {
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className={"profile card" + (config.fetchURL.includes(user.id)? ' selected':' selectable')} onClick={() => selectUser(user)}>
            <div className="picturewrapper">
                <img src={methods.fetchURLData(user.profileURL).avatarURL} />
            </div>
            <UserStats user={user} />
        </div>
    )
}
