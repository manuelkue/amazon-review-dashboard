import React from "react"

export const Settings = ({config, users, saveNewFetchURL})  => {

    //@TODO: Create component for user Details, be clickable to input profile-URL directly into Input
    const usersComponents = users.map(user => 
        <div key={user.id}>{user.name}</div>
    )

    return (
        <div className="settings">
            <p>Settings</p>
            <form>
                <label>
                    Profile URL - {config.fetchURLValid? 'true':'false'}<br />
                    <input placeholder='Link to user profile (something like "https://www.amazon.de/gp/profile/amzn1.account.XXXXXXXXXXXXXXXXXXXXXXXXXXXX")' style={{boxSizing: "border-box", borderRadius: '5px', border: '1px solid #fff', width: '100%', padding: '14px', marginTop: '10px'}} type="text" defaultValue={config.fetchURL} onChange={saveNewFetchURL} ></input>
                </label>
            </form>
            {usersComponents}
        </div>
    )
}