import React, {Component} from "react"
import { methods } from "../utilities/methods";

export const UpdatedParam = ({param, updateDifference}) => {

    return(
        <div className="paramUpdate" key={param}>
            <i className="material-icons">
                {param === 'helpfulVotes'? 'thumb_up' : ''}
                {param === 'newReview'? 'fiber_new assignment' : ''}
                {param === 'reviewText'? 'assignment edit' : ''}
                {param === 'comments'? 'comment' : ''}
                {param === 'reviewCount'? 'library_books' : ''}
                {param === 'productMissing' && updateDifference ? 'delete' : ''}
                {param === 'productMissing' && !updateDifference ? 'undo delete' : ''}
                {param === 'productTitle'? 'title edit' : ''}
            </i>
            <span className="updateDifference">{ (typeof updateDifference === 'number' && updateDifference > 0) && '+' }{ updateDifference }</span>
        </div>
    )
}
