import React, {Component} from "react"
import { methods } from "../utilities/methods";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const ReviewItem = ({config, review, reviewFunctions}) => {

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
            comments,
            date,
            // reviewHistory,
            // updatedParams,
            selected
        } = review
    
        //@TODO: selected umsetzen. Links to Amazon Seite / Produkt. Öffnet Review Details. Fehler beheben (am MacBook kam einer)
        return(
            <div className={'reviewItem' + (selected? ' selected':' selectable')} id={externalId} onClick={(event) => reviewFunctions.reviewSelected(event)}>
                <div className="material-icons columnLinkToReview externalLink">open_in_new</div>
                <div className="truncateString columnProductTitle">{methods.getProductTitle(review)}</div>
                <div className="truncateString columnReviewTitle">{reviewTitle}</div>
                <div className="truncateString columnAverageRating">{(+averageRating).toLocaleString(config.language)}</div>
                <div className="truncateString columnUserRating">{(+userRating).toLocaleString(config.language)}</div>
                <div className="truncateString columnHelpfulVotes">{(+helpfulVotes).toLocaleString(config.language)}</div>
                <div className="truncateString columnComments">{(+comments).toLocaleString(config.language)}</div>
                <div className="truncateString columnReviewDate">{new Date(date).toLocaleDateString(config.language ,{year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
            </div>
        )
}

export default ReviewItem
