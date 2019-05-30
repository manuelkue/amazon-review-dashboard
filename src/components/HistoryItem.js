import React, {Component} from "react"
import { methods } from "../utilities/methods";
import { UpdatedParam } from "./UpdatedParam";

// @TODO zu functional component umbauen, wenn selected-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

// @TODO deleted reviews are shown crossed out

export const HistoryItem = ({config, date, updatedReviews, reviewFunctions, yetToLoadHistorySubItemsCount}) => {

    const updatedReviewsComponents = updatedReviews.map(review =>
            <div
                key={review.externalId}
                className={"historySubItem" + (review.selected? ' selected':' selectable')}
                id={review.externalId}
                onClick={event => reviewFunctions.reviewSelected(event)}
            >
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
                                let updateDifference;
                                switch (typeof review[param]) {
                                    case 'number':
                                        updateDifference = review[param] - review.reviewHistory[0][param]
                                        break;
                                    case 'string':
                                        updateDifference = review.reviewHistory[0][param]
                                        break;
                                    case 'boolean':
                                        updateDifference = review[param]
                                        break;
                                    default:
                                        break;
                                }
                                return (
                                    <UpdatedParam key={param} param={param} updateDifference={updateDifference} />
                                )
                        }) :
                            <UpdatedParam key={'newReview'} param={'newReview'} updateDifference={1} />
                        }
                    </div>
                </div>
            </div>
        ).slice(0, yetToLoadHistorySubItemsCount - 1)

    return(updatedReviewsComponents.length &&
        <div className='reviewItemsWrapper'>
            <div className="historyItemsHeader">
                {new Date(date).toLocaleDateString(config.language, config.localeDateOptions) + ', ' + new Date(date).toLocaleTimeString(config.language)}
            </div>
            <div>
                {updatedReviewsComponents}
            </div>
        </div>
    )
}
