import React, { useEffect, useState } from "react"
import ReviewItem from "../ReviewItem";

import { methods } from "../../utilities/methods";
import { ProgressBar } from "../progressBar";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export const ReviewsList = ({reviews, config, status, reviewFunctions}) => {

    const [loadedReviewsCount, setLoadedReviewsCount] = useState(30)

    useEffect(() => {
        // Increase the number of displayed reviews to higher amount.
        console.log("More Reviews will load once the component is mounted, now", loadedReviewsCount);
        setLoadedReviewsCount(200)
        console.log("More Reviews loaded, now", loadedReviewsCount);
    }, [])

    const showMoreReviews = () => {
        console.log("Even more Reviews will load, now", loadedReviewsCount);
        setLoadedReviewsCount(loadedReviewsCount + 50)
        console.log("Even more Reviews loaded, now", loadedReviewsCount);
    }
    
    if(methods.fetchURLData(config.fetchURL)){
        let filteredReviews = [...reviews.filter(review => config.fetchURL.includes(review.userId))]
        methods.sortObjectArray(filteredReviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = [...filteredReviews].slice(0, loadedReviewsCount)
            .map(review => 
                <ReviewItem key={review.externalId} review={review} reviewFunctions={reviewFunctions} />
            )
            
        return (
            <div className="reviews-list">
                <button onClick={() => showMoreReviews()}>mooore</button>
                <h1>Reviews</h1>
                <div className="reviewItem reviewsHeader">
                    <div className="material-icons" >open_in_new</div>
                    <div>Product</div>
                    <div>Review Title</div>
                    <div className="material-icons" style={{fontSize : '16px'}}>star_half</div>
                    <div className="material-icons" style={{fontSize : '16px'}}>star</div>
                    <div className="material-icons" style={{fontSize : '16px'}}>thumb_up</div>
                    <div>Date</div>
                </div>
                <ProgressBar progress={status.scrapeProgress}/>
                <div className="reviewItemsWrapper">
                    {!reviewsComponents.length && 
                        <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                    }
                    {reviewsComponents}
                    {!!reviewsComponents.length && 
                        <InfinitLoadingSentinel actionOnIntersecting={() => showMoreReviews()} distanceToBottom={200} />
                    }
                </div>
            </div>
        )
    }else{
        return (
            <div className="reviews-list">
                <h1>Reviews</h1>
                <div className="reviewItem review-notification"><span>Please specify a URL in the user area that should be used for fetching review data.</span></div>
            </div>
        )
    }

}