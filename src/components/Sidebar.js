import React from "react"
import {Profile} from "./Profile"
import {Syncarea} from "./Syncarea"

export const Sidebar = props => {
    return(
        <div className="sidebar">
            <Profile user={props.user} />
            <Syncarea />
        </div>
    )
}
