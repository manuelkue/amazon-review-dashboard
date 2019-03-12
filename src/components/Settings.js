import React from "react"
import {UserCard} from '../components/UserCard'

export const Settings = ({config, users, selectUser, saveNewFetchURL})  => {

    //@TODO: Create component for user Details, be clickable to input profile-URL directly into Input
    const usersComponents = users.map(user => 
        <UserCard key={user.id} user={user} config={config} selectUser={selectUser}></UserCard>
    )

    return (
        <div className="settings">
            <h1>Settings</h1>
            <form>
                <label>
                    Profile URL {config.fetchURLValid?'':'- invalid'}<br />
                    <input className={config.fetchURLValid?'':'invalid'} placeholder='Link to user profile (something like "https://www.amazon.de/gp/profile/amzn1.account.XXXXXXXXXXXXXXXXXXXXXXXXXXXX")' type="text" defaultValue={config.fetchURL} onChange={saveNewFetchURL} ></input>
                </label>
            </form>
            <div className='userCards'>
                {usersComponents}
            </div>
        </div>
    )
}