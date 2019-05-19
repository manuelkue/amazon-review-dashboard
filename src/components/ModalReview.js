import React from "react"
import "./ModalReview.css";

export const ModalReview = ({review, copyToClipboard}) => {

    return(
        <div>
            {Object.keys(review).map(key =>
                <div key={key}>
                    <h3>{key}</h3>
                    <div onClick={() => copyToClipboard(review[key])}>{typeof review[key] === 'string' || typeof review[key] === 'number' ? review[key] : 'Not renderable'}</div>
                </div>
            )}
        </div>
    )
}