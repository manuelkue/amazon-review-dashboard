import React, {Component} from "react"

class ReviewItem extends Component{
    state = {
        clicked:false
    }

    render(){
        function idClicked(){
            console.log(this.props.review.externalId)
        }
        function reviewClicked(){
            console.log(this.props.review)
            this.setState({clicked: !this.state.clicked})
        }
    
        return(
            <div className={'review-item' + (this.state.clicked? ' clicked':'')} onClick={reviewClicked.bind(this)}>
                <div onClick={idClicked.bind(this)}>{this.props.review.externalId}</div>
                <div>{this.props.review.product.title || <i>not available anymore</i>}</div>
                <div>{this.props.review.title}</div>
                <div>{this.props.review.product.averageRating}</div>
                <div>{this.props.review.rating}</div>
                <div>{this.props.review.helpfulVotes}</div>
                <div>{new Date(this.props.review.sortTimestamp).toLocaleDateString()}</div>
            </div>
        )
    }
}

export default ReviewItem
