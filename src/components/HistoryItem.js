import React, {Component} from "react"
import { methods } from "../utilities/methods";
import { UpdatedParam } from "./UpdatedParam";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({config, date, updatedReviews, reviewFunctions}) => {

    const localeDateOptions = {year: '2-digit', month: '2-digit', day: '2-digit' };

    const updatedReviewsComponents = updatedReviews.map(review => 
            <div key={review.externalId} className={"historySubItem" + (review.selected? ' selected':' selectable')} id={review.externalId} onClick={event => reviewFunctions.reviewSelected(event)}>
                <div className="linkToReview">
                    <div className="material-icons externalLink">open_in_new</div>
                </div>
                <div className="historyItemContent">
                    <div className="historyItemHeader">
                        <span className="truncateString">{methods.getProductTitle(review)}</span>
                    </div>
                    <div className="paramUpdateWrapper">
                        {review.updatedParams.length ? 
                            review.updatedParams.map(param => {
                            const updateDifference = review[param] - review.reviewHistory[0][param]
                            return (
                                <UpdatedParam key={param} param={param} updateDifference={updateDifference} />
                            )
                        }
                        ) :
                            <UpdatedParam key={'newReview'} param={'newReview'} updateDifference={1} />
                        }
                    </div>
                </div>
            </div>
        )

    return(
        <div className='reviewItemsWrapper'>
            <div className="historyItemsHeader">
                {new Date(date).toLocaleDateString(config.language, localeDateOptions) + ', ' + new Date(date).toLocaleTimeString(config.language)}
            </div>
            <div>
                {updatedReviewsComponents}
            </div>
        </div>
    )
}
