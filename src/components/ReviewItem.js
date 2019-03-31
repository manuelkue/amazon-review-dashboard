import React, {Component} from "react"
import { methods } from "../utilities/methods";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const ReviewItem = ({review, reviewFunctions}) => {

        const{
            externalId,
            // userId,
            // syncTimestamp,
            // productTitle,
            reviewTitle,
            // reviewText,
            averageRating,
            userRating,
            helpfulVotes,
            // comments,
            date,
            // reviewHistory,
            // updatedParams,
            selected
        } = review
    
        //@TODO: selected umsetzen. Links to Amazon Seite / Produkt. Öffnet Review Details. Fehler beheben (am MacBook kam einer)
        return(
            <div className={'reviewItem' + (selected? ' selected':' selectable')} onClick={() => reviewFunctions.reviewSelected(review)}>
                <div className="material-icons externalLink" onClick={() => reviewFunctions.idSelected(externalId)}>open_in_new</div>
                <div className="truncateString">{methods.getProductTitle(review)}</div>
                <div className="truncateString">{reviewTitle}</div>
                <div className="truncateString">{averageRating}</div>
                <div className="truncateString">{userRating}</div>
                <div className="truncateString">{helpfulVotes}</div>
                <div className="truncateString">{new Date(date).toLocaleDateString()}</div>
            </div>
        )
}

export default ReviewItem
