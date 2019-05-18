import React, { useEffect } from "react"
import "./ModalContainer.css";

export const ModalContainer = ({modals, closeModal}) => {

    let modalCount = 0

    useEffect(() => {
        console.log('Modal', modalCount < modals.length ? 'added' : 'removed')
        modalCount = modals.length
    }, [modals])

    const modalComponents = [...modals].map(modal => 
        <ModalItem modal={modal} key={modal.id} />
    )

    const modalContainerStyle={
        display: modals.length ? 'flex' : 'none'
    }

    return(
        <div id="modal-container" style={modalContainerStyle} onClick={(event) => closeModal(event)}>
            {modalComponents}
        </div>
    )
}

const ModalItem = ({modal}) => {

    console.log('modal :', modal);

    return(
        <div className="modal">
            <div className="modal-header">
                <div className="modal-header-title truncateString">
                    {modal.title}
                </div>
                <div className="modal-header-menu">
                    <div id={modal.id} className="menu-action close material-icons">close</div>
                </div>
            </div>
            <div className="modal-content">
                {modal.content}
            </div>
        </div>
    )
}