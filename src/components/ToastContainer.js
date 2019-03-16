import React from "react"
import "./ToastContainer.css";

export const ToastContainer = ({toasts, dismissToast}) => {

    const toastsComponents = toasts
        .map(toast => 
            <Toast key={toast.id} toast={toast} dismissToast={dismissToast} />
        )

    return(
        <div className="toastContainer">
            {toastsComponents}
        </div>
    )
}

const Toast = ({toast, dismissToast}) => {
    return(
        <div className={"toast " + toast.type + " " + (toast.dismissed? 'dismissed' : '')} onClick={() => dismissToast(toast.id)}>
            {toast.message}
        </div>
    )
}