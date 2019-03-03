import React, {Component} from "react"

class ReviewItemComponent extends Component{
    constructor(props){
        super(props)
        this.state = {
            isChecked:this.props.review.isChecked
        }
        this.toggleChecked = this.toggleChecked.bind(this)
    }

    toggleChecked(){
        this.setState({
            isChecked: !this.state.isChecked
        })
    }

    render(){
        return(
            <div className="review-item">
                <div>{this.props.review.externalId}</div>
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

export default ReviewItemComponent
