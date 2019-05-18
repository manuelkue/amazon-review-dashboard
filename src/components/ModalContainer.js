import React, { useEffect } from "react"
import "./ModalContainer.css";

export const ModalContainer = ({modals, closeModal}) => {

    useEffect(() => {
        console.log('modal added / removed')
    }, [modals])

    const modalComponents = [...modals].map(modal => 
        <ModalItem modal={modal} closeModal={closeModal} key={modal.id} />
    )

    const modalContainerStyle={
        display: modals.length ? 'flex' : 'none'
    }

    return(
        <div className="modal-container" style={modalContainerStyle}>
            {modalComponents}
        </div>
    )
}

const ModalItem = ({modal, closeModal}) => {

    return(
        <div className="modal">
            <div className="modal-header">
                <div className="modal-header-title">
                    {modal.title}
                </div>
                <div className="modal-header-menu">
                    <div onClick={() => closeModal(modal.id)} className="menu-action material-icons">close</div>
                </div>
            </div>
            <div className="modal-content">
                {modal.content}
            </div>
        </div>
    )
}