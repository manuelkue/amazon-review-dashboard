import React from "react"
import {Profile} from "./Profile"
import {Syncarea} from "./Syncarea"
import {ToastContainer} from "./ToastContainer"

export const Sidebar = ({user, config, status, startCrawlClickHandler, dismissToast}) => {
    return(
        <div className="sidebar">
            <Profile user={user} config={config} />
            <Syncarea startCrawlClickHandler={startCrawlClickHandler} config={config} status={status}  />
            <ToastContainer toasts = {status.toasts} dismissToast={dismissToast} />
        </div>
    )
}
