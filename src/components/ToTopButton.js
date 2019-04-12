import React, { useEffect } from "react"
import "./ToTopButton.css";

export const ToTopButton = ({arrivingAtTopAction, itemToReceiveNewClassQuerySelector}) => {
    
    // arrivingAtTopAction: Action that should be executed when arriving back at the top (e.g. resetting some count of loaded elements)
    // itemToReceiveNewClassQuerySelector: gets a class 'hovering', e.g. can be made sticky when leaving the top

    //Stick reviewsHeader to top and change styling
    let classReceivingElement;
    let atTopObserver;

    useEffect(() => {
        atTopObserver = new IntersectionObserver(
            entries => {
                //Check if intersection is coming from top / bottom
                if(entries[0].boundingClientRect.height == entries[0].intersectionRect.height){
                    itemToReceiveNewClassQuerySelector && classReceivingElement.classList.remove("hovering");
                    document.querySelector(".toTopButton").classList.add("invisible");
                    arrivingAtTopAction && arrivingAtTopAction();
                }else{
                    itemToReceiveNewClassQuerySelector && classReceivingElement.classList.add("hovering");
                    document.querySelector(".toTopButton").classList.remove("invisible");
                }
              },
              {threshold: 1}
        )
        setTimeout(() => {
            classReceivingElement = document.querySelector(itemToReceiveNewClassQuerySelector) || null
            atTopObserver.observe(document.querySelector(".sentinel"))
        }, 100);

        return(() => {
            atTopObserver.disconnect();
            console.log("oberserver disconnected");
        })
    }, [])

    const scrollUp = () => {
        document.querySelector('.main').scrollTo(0, 0)
    }
    return(
        //@TODO: If the userlink has changed but no refresh was done, show in profile that current User is not the URL-specific user
        <div className="button toTopButton material-icons" style={{fontSize : '44px'}} onClick={scrollUp}>
            keyboard_arrow_up
        </div>
    )
}
