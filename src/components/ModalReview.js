import React from "react"
import "./ModalReview.css";
import { InfoCard } from "./InfoCard";
import { methods } from "../utilities/methods";

export const ModalReview = ({config, review, openExternal, copyToClipboard}) => {

    return(
        <div className="modalReview" id={review.externalId}>
            <h2>Review</h2>
            <div className="infoCardRow">
                <InfoCard icon="date_range">
                    {new Date(review.date).toLocaleDateString(config.language, config.localeDateOptions) + ', ' + new Date(review.date).toLocaleTimeString(config.language)}
                </InfoCard>
                <InfoCard center icon={[0,0,0,0,0].map((item, index) => index < review.userRating ? 'star' : 'star_border')}>
                </InfoCard>
                <InfoCard center icon="thumb_up">
                    {review.helpfulVotes}
                </InfoCard>
                <InfoCard center icon="message">
                    {review.comments}
                </InfoCard>
                <InfoCard head="Review ID">
                    {review.externalId}
                </InfoCard>
                <InfoCard head="Verified Purchase">
                    {review.verifiedPurchase? 'Yes' : 'No'}
                </InfoCard>
                <InfoCard head="Vine">
                    {review.vine? 'Yes' : 'No'}
                </InfoCard>
            </div>
            <div className="infoCardRow">
                <InfoCard icon="open_in_new" onClick={() => openExternal.review(review.externalId)} externalLink/>
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
                <InfoCard head="ASIN">
                    {review.productAsin}
                </InfoCard>
                <InfoCard head="Product available">
                    {review.productMissing? 'No' : 'Yes'}
                </InfoCard>
                <InfoCard center icon={[0,0,0,0,0].map((item, index) => (index + 1) - review.averageRating < 0.25 ?  'star' : ((index + 1) - review.averageRating > 0.75 ? 'star_border' : 'star_half'))}>
                    {review.averageRating}
                </InfoCard>
            </div>
            <div className="infoCardRow">
                <InfoCard icon="open_in_new" onClick={() => openExternal.product(review.productAsin)} externalLink/>
                <InfoCard icon="link content_copy" onClick={() => copyToClipboard(methods.createURL(config, {productAsin: review.productAsin}))}>
                    <div>{methods.createURL(config, {productAsin: review.productAsin, omitPartnerTag: true})}</div>
                </InfoCard>
            </div>

            <h2>Review History</h2>

            {review.updatedParams.map((updatedParam, index) =>
            <div key={review.reviewHistory[index].syncTimestamp}>
                <div>Change on {
                    new Date(review.reviewHistory[index].syncTimestamp).toLocaleDateString(config.language, config.localeDateOptions) + ', ' + new Date(review.reviewHistory[index].syncTimestamp).toLocaleTimeString(config.language)
                    }</div>
                <div>
                    <i className="material-icons">
                        {updatedParam === 'helpfulVotes'? 'thumb_up' : ''}
                        {updatedParam === 'newReview'? 'fiber_new assignment' : ''}
                        {updatedParam === 'reviewText'? 'assignment edit' : ''}
                        {updatedParam === 'comments'? 'comment' : ''}
                        {updatedParam === 'reviewCount'? 'library_books' : ''}
                        {updatedParam === 'productMissing' && review.reviewHistory[index].productMissing ? 'delete' : 'undo delete'}
                        {updatedParam === 'productTitle'? 'title edit' : ''}
                    </i>
                </div>

            </div>
            )}
        </div>
    )
}