import React, { Component } from 'react';
import './AppComponent.css';

import HeaderComponent from './components/HeaderComponent'
import ReviewsListComponent from './components/ReviewsListComponent'
import FooterComponent from './components/FooterComponent'

class AppComponent extends Component {
    render() {
        return (
            <div className="App">
              <HeaderComponent />
              <ReviewsListComponent />
              <FooterComponent />
            </div>
    );
  }
}

export default AppComponent;
