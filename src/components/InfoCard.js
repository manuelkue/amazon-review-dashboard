import React from "react"
import "./InfoCard.css";

export const InfoCard = ({children, icon, head, onClick, center, externalLink, small}) => 
    <div className={
        "infoCard card" +
        (onClick? ' selectable':'') +
        (center? ' center':'') +
        (externalLink? ' externalLink':'') +
        (small? ' small':'')} 
        onClick={onClick? event => onClick(event) : null}
    >
        {icon? 
            <div className="material-icons">{icon}</div> :
            <div className="head truncateString">{head}</div>
        }
        {children !== undefined?
            <div>{children}</div>:
            null
        }
    </div>
