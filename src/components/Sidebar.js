import React from "react"
import {Profile} from "./Profile"
import {Syncarea} from "./Syncarea"

export const Sidebar = ({user, config, status, startCrawlClickHandler}) => {
    return(
        <div className="sidebar">
            <Profile user={user} config={config} />
            <Syncarea startCrawlClickHandler={startCrawlClickHandler} config={config} status={status}  />
        </div>
    )
}
