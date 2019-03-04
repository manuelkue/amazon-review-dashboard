const initialConfigState = {
    scrapeStatus: '',
    scrapeProgress: 0
}
const configReducer = (state = initialConfigState, action) => {
    switch (action.type){
      case 'UPDATE_SCRAPE_STATUS':
        return {
          ...state, scrapeStatus: action.payload
          // Overrides the result-property of the spreaded object. So all properties still are in the state, but updated
        }
      case 'UPDATE_SCRAPE_PROGRESS':
      return {
        ...state, scrapeProgress: action.payload
      }
      default: return state;
    }
  }

  export default configReducer