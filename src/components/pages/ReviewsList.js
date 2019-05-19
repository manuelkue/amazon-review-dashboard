import React, { useState } from "react"
import ReviewItem from "../ReviewItem";

import { methods } from "../../utilities/methods";
import { ProgressBar } from "../progressBar";
import { ToTopButton } from "../ToTopButton";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the component
// -> ({reviews, config}) = (props)
// Utilizes hooks to use "class functionality" (useState, useEffect)

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
    const [showMoreReviewsBlocked, setShowMoreReviewsBlocked] = useState(false)

    const showMoreReviews = () => {
        // Increase the number of displayed reviews to higher amount.
        if(showMoreReviewsBlocked){
            console.log("Loading of more reviews blocked while searching");
        }else{
            setLoadedReviewsCount(loadedReviewsCount + 100)
            console.log("More Reviews loaded");
        }
    }

    const handleFilterTermInput = (event) => {
        setFilterTerm(event.target.value.toLowerCase())
        setShowMoreReviewsBlocked(true);
        setTimeout(() => {
            setShowMoreReviewsBlocked(false);
        }, 1000);
    }

    const handleFilterOptionsChange = ({target}) => {
        setFilterOptions({...filterOptions, [target.name]: target.checked})
    }
    const {sortBy} = reviewFunctions;

    const sortingBy = header => {
        if (config.sortReviewsBy === header) return config.sortReviewsAscending ? "sortingAsc " : "sortingDesc ";
        return ''
    }

    if(methods.fetchURLData(config.fetchURL)){
        let filteredReviews = [...reviews].filter(review => {
                if(filterTerm === "") return true;
                if(
                    (review.productTitle.toLowerCase().includes(filterTerm) && filterOptions.filterByProduct)
                    || (review.reviewTitle.toLowerCase().includes(filterTerm) && filterOptions.filterByReviewTitle)
                    || (review.externalId.toLowerCase().includes(filterTerm) && filterOptions.filterByReviewTitle)
                    || (review.reviewText.toLowerCase().includes(filterTerm) && filterOptions.filterByReviewText)
                ) return true
                return false;
            })
        methods.sortArray(filteredReviews, config.sortReviewsBy, config.sortReviewsAscending)
        const reviewsComponents = [...filteredReviews].slice(0, loadedReviewsCount)
            .map(review => 
                <ReviewItem key={review.externalId} config = {config} review={review} reviewFunctions={reviewFunctions} />
            )

        return (
            <div className="reviews-list">
                <ToTopButton arrivingAtTopAction={() => setLoadedReviewsCount(230)} itemToReceiveNewClassQuerySelector = ".reviewItem.reviewsHeader"/>
                <div className="filterWrapper">
                    <h1 className="truncateString">Reviews{filterTerm ? ": " + filteredReviews.length : ''}</h1>
                    <input
                        placeholder='Filter reviews...'
                        type="text" value={filterTerm}
                        onChange={handleFilterTermInput}
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

                <div className="sentinel"></div>
                <div className="reviewItem reviewsHeader">
                    <div className="material-icons columnLinkToReview" >open_in_new</div>
                    <div onClick={() => sortBy("productTitle")} className={sortingBy("productTitle") + "columnProductTitle"}>Product</div>
                    <div onClick={() => sortBy("reviewTitle")}  className={sortingBy("reviewTitle") + "columnReviewTitle"}>Review Title</div>
                    <div onClick={() => sortBy("averageRating")}className={sortingBy("averageRating") + "material-icons columnAverageRating"} style={{fontSize : '16px'}}>star_half</div>
                    <div onClick={() => sortBy("userRating")}   className={sortingBy("userRating") + "material-icons columnUserRating"} style={{fontSize : '16px'}}>star</div>
                    <div onClick={() => sortBy("helpfulVotes")} className={sortingBy("helpfulVotes") + "material-icons columnHelpfulVotes"} style={{fontSize : '16px'}}>thumb_up</div>
                    <div onClick={() => sortBy("comments")}     className={sortingBy("comments") + "material-icons columnComments"} style={{fontSize : '16px'}}>message</div>
                    <div onClick={() => sortBy("date")}         className={sortingBy("date") + "columnReviewDate"}>Date</div>
                </div>
                <ProgressBar progress={status.scrapeProgress}/>
                <div className="reviewItemsWrapper">
                    {!reviewsComponents.length && 
                        <div className="reviewItem review-notification"><span>No reviews found</span></div>
                    }
                    {reviewsComponents}
                    {!!reviewsComponents.length && 
                        <InfinitLoadingSentinel actionOnIntersecting={showMoreReviews} distanceToBottom={50} />
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