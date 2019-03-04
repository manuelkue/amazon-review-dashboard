import { createStore, combineReducers } from 'redux'

import config from './reducers/configReducer'
import user from './reducers/userReducer'
import reviews from './reducers/reviewsReducer'

export default createStore(
    combineReducers({
        config,
        user,
        reviews
  }))