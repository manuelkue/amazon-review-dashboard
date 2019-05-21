import React from "react"
import {UserCard} from '../UserCard'

const Users = ({config, status, users, selectUser, saveNewFetchURL, saveNewPartialCrawlNumber})  => {

    //@TODO: Create component for user Details, be clickable to input profile-URL directly into Input
    const usersComponents = users.map(user =>
        <UserCard key={user.id} user={user} config={config} selectUser={selectUser}></UserCard>
    )

    return (
        <div className="users">
            <h1>User</h1>
            <div className = "inputHeading">
                Choose your profile {status.fetchURLValid?'':'- invalid URL'}<br />
            </div>
            <input className={status.fetchURLValid?'':'invalid'} placeholder='Link to user profile (something like "https://www.amazon.de/gp/profile/amzn1.account.XXXXXXXXXXXXXXXXXXXXXXXXXXXX")' type="text" defaultValue={config.fetchURL} onChange={saveNewFetchURL} ></input>
            <div className='userCards'>
                {usersComponents}
            </div>
        </div>
    )
}

export default Users;