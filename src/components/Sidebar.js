import React from "react"
import {Profile} from "./Profile"
import {Syncarea} from "./Syncarea"
import {ToastContainer} from "./ToastContainer"

export const Sidebar = ({user, config, status, startCrawlClickHandler, toasts, dismissToast}) => {
    return(
        <div className="sidebar">
            <Profile user={user} status={status} startCrawlClickHandler={startCrawlClickHandler} config={config} />
            <Syncarea user={user} startCrawlClickHandler={startCrawlClickHandler} config={config} status={status}  />
            <ToastContainer toasts = {toasts} dismissToast={dismissToast} />
        </div>
    )
}
