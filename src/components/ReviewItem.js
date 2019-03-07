import React, {Component} from "react"

// @TODO zu functional component umbauen, wenn clicked-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

class ReviewItem extends Component{

    render(){
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
            clicked
        } = this.props.review

        function idClicked(){
            console.log(externalId)
        }
        function reviewClicked(){
            console.log(this.props.review)
            clicked = !clicked
        }
    
        //@TODO: clicked umsetzen. Fehler beheben (am MacBook kam einer)
        return(
            <div className={'review-item' + (clicked? ' clicked':'')} onClick={reviewClicked.bind(this)}>
                <div onClick={idClicked.bind(this)}>{externalId}</div>
                <div>{productTitle || <i>not available anymore</i>}</div>
                <div>{reviewTitle}</div>
                <div>{averageRating}</div>
                <div>{userRating}</div>
                <div>{helpfulVotes}</div>
                <div>{new Date(date).toLocaleDateString()}</div>
            </div>
        )
    }
}

export default ReviewItem
