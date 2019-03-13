import React from "react"
import {UserCard} from '../UserCard'

export const Settings = ({config, users, selectUser, saveNewFetchURL})  => {

    //@TODO: Create component for user Details, be clickable to input profile-URL directly into Input
    const usersComponents = users.map(user => 
        <UserCard key={user.id} user={user} config={config} selectUser={selectUser}></UserCard>
    )

    return (
        <div className="settings">
            <h1>Settings</h1>
            <label>
                Choose your profile {config.fetchURLValid?'':'- invalid URL'}<br />
                <input className={config.fetchURLValid?'':'invalid'} placeholder='Link to user profile (something like "https://www.amazon.de/gp/profile/amzn1.account.XXXXXXXXXXXXXXXXXXXXXXXXXXXX")' type="text" defaultValue={config.fetchURL} onChange={saveNewFetchURL} ></input>
            </label>
            <div className='userCards'>
                {usersComponents}
            </div>
        </div>
    )
}