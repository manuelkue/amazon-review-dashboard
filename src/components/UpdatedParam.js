import React, {Component} from "react"
import { methods } from "../utilities/methods";

export const UpdatedParam = ({param, updateDifference}) => {

    return(
        <div className="paramUpdate" key={param}>
            <i className="material-icons">
                {param === 'helpfulVotes'? 'thumb_up' : ''}
                {param === 'newReview'? 'assignment' : ''}
                {param === 'comments'? 'comment' : ''}
                {param === 'productMissing' && !(updateDifference < 0) ? 'delete' : ''}
                {param === 'productMissing' && updateDifference < 0 ? 'undo delete' : ''}
                {param === 'productTitle'? 'title edit' : ''}
            </i>
                {param === 'helpfulVotes' || param === 'comments' ? 
                    <span className="updateDifference">  
                        {(updateDifference > 0 ? '+':'') + updateDifference}
                    </span> : ''
                }
        </div>
    )
}
