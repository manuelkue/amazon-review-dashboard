import React from "react"

export const ProgressBar = ({progress}) => {
    return(
    <div className="progressBar" style={{width: '100%', boxSizing:'border-box',  background: 'var(--color-light2)', borderRadius:'var(--border-radius-m)', marginBottom: 'var(--spacing-s)'}}>
        <div style={{width: progress + '%', display: 'block', height:'var(--spacing-s)', background: 'var(--color-secondary)', borderRadius:'var(--border-radius-m)'}}></div>
    </div>
    )
}
