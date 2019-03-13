import React, {Component} from "react"

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const ReviewItem = ({review, reviewFunctions}) => {

        const{
            externalId,
            userId,
            syncTimestamp,
            productTitle,
            reviewTitle,
            reviewText,
            averageRating,
            userRating,
            helpfulVotes,
            comments,
            date,
            reviewHistory,
            updatedParams,
            selected
        } = review
    
        //@TODO: selected umsetzen. Links to Amazon Seite / Produkt. Öffnet Review Details. Fehler beheben (am MacBook kam einer)
        return(
            <div className={'review-item' + (selected? ' selected':' selectable')} onClick={() => reviewFunctions.selected(review)}>
                <div onClick={() => reviewFunctions.selected(externalId)}>{externalId}</div>
                <div>{productTitle || <i>not available anymore</i>}</div>
                <div>{reviewTitle}</div>
                <div>{averageRating}</div>
                <div>{userRating}</div>
                <div>{helpfulVotes}</div>
                <div>{new Date(date).toLocaleDateString()}</div>
            </div>
        )
}

export default ReviewItem
