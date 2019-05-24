import React from "react"
import "./ModalReview.css";

export const ModalReview = ({config, review, copyToClipboard}) => {

    const parser = new DOMParser();
    const dom = parser.parseFromString(review.reviewText, 'text/html');
    const reviewText = dom.body.textContent;
    console.log('reviewText :', reviewText);

    return(
        <>
            <h2>Review</h2>
            <div className="modalReview">
                <div className="reviewSide">
                    <div className="card">
                        <h3>Date</h3>
                        {new Date(review.date).toLocaleDateString(config.language, config.localeDateOptions) + ', ' + new Date(review.date).toLocaleTimeString(config.language)}
                    </div>
                    <div className="card">
                        <h3>Your rating</h3>
                        {review.userRating}
                    </div>
                    <div className="card">
                        <h3>Helpful votes</h3>
                        {review.helpfulVotes}
                    </div>
                    <div className="card">
                        <h3>Comments</h3>
                        {review.comments}
                    </div>
                    <div className="card">
                        <h3>Review ID</h3>
                        {review.externalId}
                    </div>
                    <div className="card">
                        <h3>Verified Purchase</h3>
                        {review.verifiedPurchase? 'Yes' : 'No'}
                    </div>
                    <div className="card">
                        <h3>Vine</h3>
                        {review.vine? 'Yes' : 'No'}
                    </div>
                </div>
                <div className="card reviewMain">
                    <h3>{review.reviewTitle}</h3>
                    {reviewText}
                </div>
            </div>

            <h2>Product Details</h2>
            
            <div className="modalReview">
                <div className="reviewSide">
                    <div className="card">
                        <h3>ASIN</h3>
                        {review.productAsin}
                    </div>
                    <div className="card">
                        <h3>Product available</h3>
                        {review.productMissing? 'No' : 'Yes'}
                    </div>
                    <div className="card">
                        <h3>Average Rating</h3>
                        {review.averageRating}
                    </div>
                </div>
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
                        {updatedParam === 'productMissing' && review.reviewHistory[index].productMissing ? 'delete' : 'undo delete'}
                        {updatedParam === 'productTitle'? 'title edit' : ''}
                    </i>
                </div>

            </div>
            )}
        </>
    )
}