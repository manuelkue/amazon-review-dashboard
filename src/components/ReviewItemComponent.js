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
        const labelStyle = {
            textDecoration: (this.state.isChecked && 'line-through') || undefined
        }

        return(
            <label className="review-item">
                <span>{this.props.review.id})</span>
                <input type="checkbox" checked={this.state.isChecked} onChange={this.toggleChecked}/>
                <span style={labelStyle}>{this.props.review.text}</span>
            </label>
        )

    }
}

export default ReviewItemComponent
