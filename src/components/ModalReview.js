import React from "react"
import "./ModalReview.css";
import { InfoCard } from "./InfoCard";
import { methods } from "../utilities/methods";
import { UpdatedParam } from "./UpdatedParam";

export const ModalReview = ({config, review, openExternal, copyToClipboard}) => {

    const{language, localeDateOptions} = config

    return(
        <div className="modalReview" id={review.externalId}>
            <div className="infoCardRow">
                <InfoCard icon="date_range">
                    {new Date(review.date).toLocaleDateString(language, localeDateOptions) + ', ' + new Date(review.date).toLocaleTimeString(language)}
                </InfoCard>
                <InfoCard center icon={[0,0,0,0,0].map((item, index) => index < review.userRating ? 'star' : 'star_border')}>
                </InfoCard>
                <InfoCard center icon="thumb_up">
                    {review.helpfulVotes}
                </InfoCard>
                <InfoCard center icon="message">
                    {review.comments}
                </InfoCard>
                <InfoCard icon={review.verifiedPurchase? 'shopping_cart' : 'remove_shopping_cart'} small>
                    {review.verifiedPurchase? 'Yes' : 'No'}
                </InfoCard>
                <InfoCard head="Vine" small>
                    {review.vine? 'Yes' : 'No'}
                </InfoCard>
                <InfoCard head="Review ID">
                    {review.externalId}
                </InfoCard>
            </div>
            <div className="infoCardRow">
                <InfoCard icon="open_in_new" onClick={() => openExternal.review(review.externalId)} externalLink small/>
                <InfoCard icon="link content_copy" onClick={() => copyToClipboard(methods.createURL(config, {reviewId: review.externalId}))}>
                    <div>{methods.createURL(config, {reviewId: review.externalId, omitPartnerTag: true})}</div>
                </InfoCard>
            </div>
            <div className="card reviewMain">
                <b dangerouslySetInnerHTML={{__html: review.reviewTitle}}></b>
                <div dangerouslySetInnerHTML={{__html: review.reviewText}}></div>
            </div>

            <h2>Product Details</h2>

            <div className="infoCardRow">
                <InfoCard head="Title">
                    {methods.getProductTitle(review)}
                </InfoCard>
            </div>

            <div className="infoCardRow">
                <InfoCard head="ASIN">
                    {review.productAsin}
                </InfoCard>
                <InfoCard head="Product available">
                    {review.productMissing? 'No' : 'Yes'}
                </InfoCard>
                <InfoCard icon="library_books" center>
                    {review.reviewCount}
                </InfoCard>
                <InfoCard center icon={[0,0,0,0,0].map((item, index) => (index + 1) - review.averageRating < 0.25 ?  'star' : ((index + 1) - review.averageRating > 0.75 ? 'star_border' : 'star_half'))}>
                    {review.averageRating}
                </InfoCard>
            </div>
            <div className="infoCardRow">
                <InfoCard icon="open_in_new" onClick={() => openExternal.product(review.productAsin)} externalLink small/>
                <InfoCard icon="link content_copy" onClick={() => copyToClipboard(methods.createURL(config, {productAsin: review.productAsin}))}>
                    <div>{methods.createURL(config, {productAsin: review.productAsin, omitPartnerTag: true})}</div>
                </InfoCard>
            </div>

            <h2>Review History</h2>

            {review.reviewHistory.map((historyItem, index) => {
                const reviewReference = index === 0? review : review.reviewHistory[index-1]

                return(
                <InfoCard
                    key={reviewReference.syncTimestamp}
                    head={new Date(reviewReference.syncTimestamp).toLocaleDateString(language, localeDateOptions)}
                >
                    {reviewReference.updatedParams.map(param => {
                        let updateDifference;
                        switch (typeof review[param]) {
                            case 'number':
                                if(!review.reviewHistory[index].updatedParams.length){
                                    console.log('lastItemReached');
                                    updateDifference = review.reviewHistory[index][param]
                                }else{
                                    updateDifference = (reviewReference[param] === undefined ? review[param] : reviewReference[param]) - review.reviewHistory[index][param]
                                }
                                break;
                            case 'string':
                                updateDifference = review.reviewHistory[index][param]
                                break;
                            case 'boolean':
                                updateDifference = (reviewReference[param] === undefined ? review[param] : reviewReference[param])?  'Product not available anymore' : 'Product available again'
                                break;
                            default:
                                break;
                        }
                        return <UpdatedParam key={param} param={param} updateDifference={updateDifference} />
                    })}
                </InfoCard>
                )
                }
            )}
        </div>
    )
}