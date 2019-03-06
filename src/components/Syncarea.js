import React from "react"

export const Syncarea = props => {
    return(
        <div className="syncarea">
            <div className="syncButtonsWrapper">
                <div className="syncButton">
                    <i className="material-icons">refresh</i>
                    <span>Complete</span>
                </div>
                <div className="syncButton">
                    <i className="material-icons">refresh</i>
                    <span>Partially</span>
                </div>
            </div>
            <div className="syncStats">
                <i className="material-icons">history</i>
                <div className="syncStatsBody">
                    <div>Updates since last sync (-)</div>
                    <div className="syncStatsBodyContent">
                        <div className="syncStatsEntry">
                            <i className="material-icons">equalizer</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">thumb_up</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">create</i>
                            -3
                        </div>
                        <div className="syncStatsEntry">
                            <i className="material-icons">comment</i>
                            -3
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
