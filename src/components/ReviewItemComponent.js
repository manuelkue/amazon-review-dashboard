import React, {Component} from "react"

class ReviewItemComponent extends Component{
    render(){
        const labelStyle = {
            textDecoration: (this.props.review.isChecked && 'line-through') || undefined
        }

        return(
            <label className="review-item">
                <span>{this.props.review.id})</span>
                <input type="checkbox" defaultChecked={this.props.review.isChecked}/>
                <span style={labelStyle}>{this.props.review.text}</span>
            </label>
        )

    }
}

export default ReviewItemComponent
