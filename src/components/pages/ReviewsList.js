import React, {Component} from "react"
import ReviewItem from "../ReviewItem";

import {methods} from "../../utilities/methods";
import { ProgressBar } from "../progressBar";
import { InfinitLoadingSentinel } from "../InfinitLoadingSentinel";


// Functional / stateless component, pass props and work directly with it.
// passed prop can be accessed via destructuring in the building of the comonent
// -> ({reviews, config}) = (props)

//@TODO: Include search field to filter reviews

//@TODO: integrate sort by clicking the header, sort for deleted as well

export class ReviewsList extends Component {

    constructor(props){
        super()

        // limit shown number at the start of the component
        this.state = {
            loadedReviewsCount : 30
        }
    }

    render(){
        const {reviews, config, status, reviewFunctions} = this.props
        
        if(methods.fetchURLData(config.fetchURL)){
            let filteredReviews = [...reviews.filter(review => config.fetchURL.includes(review.userId))]
            methods.sortObjectArray(filteredReviews, config.sortReviewsBy, config.sortReviewsAscending)
            const reviewsComponents = [...filteredReviews].slice(0, this.state.loadedReviewsCount)
                .map(review => 
                    <ReviewItem key={review.externalId} review={review} reviewFunctions={reviewFunctions} />
                )
                
            return (
                <div className="reviews-list">
                    <h1>Reviews</h1>
                    <div className="reviewItem reviewsHeader">
                        <div><i className="material-icons">open_in_new</i></div>
                        <div>Product</div>
                        <div>Review Title</div>
                        <div><i className="material-icons" style={{fontSize : '16px'}}>star_half</i></div>
                        <div><i className="material-icons" style={{fontSize : '16px'}}>star</i></div>
                        <div><i className="material-icons" style={{fontSize : '16px'}}>thumb_up</i></div>
                        <div>Date</div>
                    </div>
                    <ProgressBar progress={status.scrapeProgress}/>
                    <div className="reviewItemsWrapper">
                        {!reviewsComponents.length && 
                            <div className="reviewItem review-notification"><span>Reviews loaded: {status.scrapeProgress}%</span></div>
                        }
                        {reviewsComponents}
                        {!!reviewsComponents.length && 
                            <InfinitLoadingSentinel actionOnIntersecting={this.showMoreReviews.bind(this)} distanceToBottom={200} />
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

    showMoreReviews(){
        this.setState({
            loadedReviewsCount: this.state.loadedReviewsCount + 1000
        })
        console.log("More Reviews loaded");
    }

    componentDidMount(){
        // Increase the number of displayed reviews to higher amount.
        //@TODO: Find out why this has to happen in a Timeout. Without, the render() at start waits for the setState...
        setTimeout(() => {
            this.setState({
                loadedReviewsCount: 1000
            })
        }, 0);
    }

}