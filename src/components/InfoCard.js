import React from "react"
import "./InfoCard.css";

export const InfoCard = ({children, icon, head, onClick, center, externalLink}) => 
    <div className={"infoCard card" + (onClick? ' selectable':'') + (center? ' center':'') + (externalLink? ' externalLink':'')} onClick={onClick? event => onClick(event) : null}>
        {icon? 
            <div className="material-icons">{icon}</div> :
            <div><b>{head}</b></div>
        }
        {children !== undefined?
            <div>{children}</div>:
            null
        }
    </div>
