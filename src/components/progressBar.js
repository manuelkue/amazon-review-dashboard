import React from "react"

export const ProgressBar = ({progress}) => {

    const wrapperStyle={
        width: '100%',
        boxSizing:'border-box',
        background: 'var(--color-light2)',
        borderRadius:'var(--border-radius-m)',
        marginBottom: 'var(--spacing-s)'
    }

    const innerStyle={
        width: progress + '%',
        display: 'block',
        height:'var(--spacing-s)',
        background: 'var(--color-secondary)',
        borderRadius:'var(--border-radius-m)'
    }

    return(
    <div className="progressBar" style={wrapperStyle}>
        <div style={innerStyle}></div>
    </div>
    )
}
