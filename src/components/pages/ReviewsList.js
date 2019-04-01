import React, { useState, useEffect} from "react"
import ReviewItem from "../ReviewItem";

import {methods} from "../../utilities/methods";
import { ProgressBar } from "../progressBar";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the component
// -> ({reviews, config}) = (props)
// Utilizes hooks to use "class functionality" (useState, useEffect)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export const ReviewsList = ({reviews, config, status, reviewFunctions}) => {

    // limit shown number at the start of the component
    const [loadedReviewsCount, setLoadedReviewsCount] = useState(30)
    const [filterTerm, setFilterTerm] = useState("")
    const [filterOptions, setFilterOptions] = useState({
        filterByProduct : true,
        filterByReviewTitle : true,
        filterByReviewText : false
    })

    useEffect(() => {
        showMoreReviews()
    }, [])

    const showMoreReviews = () => {
        // Increase the number of displayed reviews to higher amount.
        setLoadedReviewsCount(loadedReviewsCount + 1000)
        console.log("More Reviews loaded");
    }

    const handleFilterOptionsChange = ({target}) => {
        setFilterOptions({...filterOptions, [target.name]: target.checked})
    }

    if(methods.fetchURLData(config.fetchURL)){
        let filteredReviews = [...reviews.filter(review => config.fetchURL.includes(review.userId))]
            .filter(review => {
                if(filterTerm === "") return true;
                if(
                    (review.productTitle.toLowerCase().includes(filterTerm) && filterOptions.filterByProduct)
                    || (review.reviewTitle.toLowerCase().includes(filterTerm) && filterOptions.filterByReviewTitle)
                    || (review.reviewText.toLowerCase().includes(filterTerm) && filterOptions.filterByReviewText)
                ) return true
                return false;
            })
        methods.sortObjectArray(filteredReviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = [...filteredReviews].slice(0, loadedReviewsCount)
            .map(review => 
                <ReviewItem key={review.externalId} config = {config} review={review} reviewFunctions={reviewFunctions} />
            )
            
        return (
            <div className="reviews-list">
                <div className="filterWrapper">
                    <h1 className="truncateString">Reviews {filterTerm ? "- " + filteredReviews.length : ''}</h1>
                    <input
                        placeholder='Filter reviews...'
                        type="text" value={filterTerm}
                        onChange={(event) => setFilterTerm(event.target.value.toLowerCase())}
                    />
                    <label>
                        Product:
                        <input
                            name="filterByProduct"
                            type="checkbox"
                            checked={filterOptions.filterByProduct}
                            onChange={handleFilterOptionsChange}
                        />
                    </label>
                    <label>
                        Review:
                        <input
                            name="filterByReviewTitle"
                            type="checkbox"
                            checked={filterOptions.filterByReviewTitle}
                            onChange={handleFilterOptionsChange}
                        />
                    </label>
                    <label>
                        Review text:
                        <input
                            name="filterByReviewText"
                            type="checkbox"
                            checked={filterOptions.filterByReviewText}
                            onChange={handleFilterOptionsChange}
                        />
                    </label>
                </div>


                <div className="reviewItem reviewsHeader">
                    <div className="material-icons columnLinkToReview" >open_in_new</div>
                    <div className="columnProductTitle">Product</div>
                    <div className="columnReviewTitle">Review Title</div>
                    <div className="material-icons columnAverageRating" style={{fontSize : '16px'}}>star_half</div>
                    <div className="material-icons columnUserRating" style={{fontSize : '16px'}}>star</div>
                    <div className="material-icons columnHelpfulVotes" style={{fontSize : '16px'}}>thumb_up</div>
                    <div className="material-icons columnComments" style={{fontSize : '16px'}}>message</div>
                    <div className="columnReviewDate">Date</div>
                </div>
                <ProgressBar progress={status.scrapeProgress}/>
                <div className="reviewItemsWrapper">
                    {!reviewsComponents.length && 
                        <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                    }
                    {reviewsComponents}
                    {!!reviewsComponents.length && 
                        <InfinitLoadingSentinel actionOnIntersecting={showMoreReviews} distanceToBottom={200} />
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