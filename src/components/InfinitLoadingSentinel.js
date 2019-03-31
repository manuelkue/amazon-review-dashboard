import React, {Component}  from "react"
import { render } from "react-dom";

export class InfinitLoadingSentinel extends Component {

    observer;

    constructor(props){
        super()
    }

    render(){
        const sentinelStyle = {
            display: 'block',
            width: '1px',
            height: this.props.distanceToBottom,
            marginTop: - this.props.distanceToBottom,
            visibility:'hidden'
        }

        return(
            <div id="sentinel" style={sentinelStyle}>
            </div>
        )
    }

    componentDidMount(){
        this.observer = new IntersectionObserver(
            entries => {
                //Check if viewport enters or leaves intersection 
                if(entries[0].isIntersecting){
                    console.log(entries[0]);
                    this.props.actionOnIntersecting()
                }
              },
              {threshold: 0}
        )
    
        this.observer.observe(document.querySelector("#sentinel"))
    }

    componentWillUnmount(){
        this.observer.disconnect();
        console.log("oberserver disconnected");
    }
}