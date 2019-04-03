import React from "react"
import "./ToTopButton.css";

export const ToTopButton = window => {

    const scrollUp = () => {
        document.querySelector('.main').scrollTo(0, 0)
    }
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className="button toTopButton material-icons" style={{fontSize : '44px'}} onClick={scrollUp}>
            keyboard_arrow_up
        </div>
    )
}
