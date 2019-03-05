import React, {Component} from "react"

// @TODO zu functional component umbauen, wenn clicked-state von über-Komponente kommt bzw. im Reviews-Array integriert wurde

class ReviewItem extends Component{
    state = {
        clicked:false
    }

    render(){
        const{externalId, title, rating, helpfulVotes, sortTimestamp, product} = this.props.review

        function idClicked(){
            console.log(externalId)
        }
        function reviewClicked(){
            console.log(this.props.review)
            this.setState({clicked: !this.state.clicked})
        }
    
        return(
            <div className={'review-item' + (this.state.clicked? ' clicked':'')} onClick={reviewClicked.bind(this)}>
                <div onClick={idClicked.bind(this)}>{externalId}</div>
                <div>{product.title || <i>not available anymore</i>}</div>
                <div>{title}</div>
                <div>{product.averageRating}</div>
                <div>{rating}</div>
                <div>{helpfulVotes}</div>
                <div>{new Date(sortTimestamp).toLocaleDateString()}</div>
            </div>
        )
    }
}

export default ReviewItem
