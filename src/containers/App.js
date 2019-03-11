import React, { Component } from "react";
import {
  Route,
  NavLink,
  Switch,
  BrowserRouter as Router
} from "react-router-dom";
import "./App.css";

import { Sidebar } from "../components/Sidebar";
import { ReviewsList } from "../components/ReviewsList";
import { History } from "../components/History";
import { Settings } from "../components/Settings";
import { connect } from "react-redux";
import { methods } from "../utilities/methods";
import {
  Storage,
  reviewStorage,
  userStorage,
  configStorage,
  logStorage
} from "../utilities/Storage";
import { Review } from "../Models/Review";
import reviewsData from "../data/reviews";
import userData from "../data/user";

const { ipcRenderer } = window.require("electron");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        fetchURL: "",
        fetchURLGetsValidated: "",
        fetchURLValid: false,
        maxReviewNumberOnPartScrape: 15,
        sortReviewsBy: null,
        sortReviewsAscending: false,
        scrapeStatus: "-",
        scrapeProgress: 0,
        isScrapingComplete: false,
        isScrapingPartially: false,
        appInitStarted: false
      },
      users: [],
      reviews: []
    };
    //@TODO: Edit maxReviewNumber of partially fetched in Settings
    //@TODO: Function to click on reviewHeaders and change this.state.config.sortReviewsBy:'helpfulVotes', ...sortReviewsAscending:false

    ipcRenderer.on("profileScraped", (event, profile) => {
      methods
        .saveUser(profile, this.state.config.fetchURL)
        .then(() => {
          userStorage
            .get("users")
            .then(users => {
              this.setState(
                {
                  users: users
                },
                () => {
                  console.log("users", this.state.users);
                }
              );
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("reviewsScrapedSoFar", (event, reviewsCount) => {
      //@TODO: Save reviews scraped so far, to get newest reviews if Amazon blocks
      this.setState({
        config: {
          ...this.state.config,
          scrapeProgress:
            this.state.users.find(user => this.state.config.fetchURL.includes(user.id)).reviewsCount ?
              methods.round((reviewsCount * 100) / this.state.users.find(user => this.state.config.fetchURL.includes(user.id)).reviewsCount,0)
              :
              0
        }
      });
      console.log("ScrapeProgress", this.state.config.scrapeProgress);
    });
    ipcRenderer.on("reviewsScrapedInterrupted", (event, reviews) => {
      // @TODO show the user that only partially fetched and how much, !!!!Toast erzeugen!!!!!
      console.error("Scraping interrupted.");
      methods
        .saveReviews(reviews, this.state.config.fetchURL)
        .then(() => {
          reviewStorage
            .get("reviews")
            .then(reviews => {
              this.setState({
                reviews: reviews
              });
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("reviewsScraped", (event, reviewsScraped) => {
      console.log("reviews", reviewsScraped);
      //@TODO: Saving error:
      /*
        {
          "user":
            {
              "helpfulVotes":"86.408","reviewsCount":"5.155","id":"AH3MZRQZZDZYZCRBNRD57TOZQG3Q","rank":3,"name":"Apicula"
            },
          "reviews":[]}externalId":"R38MSW5OQN8TDC","userId":"AHIML2WDUBRNHH47SS5PZEWVBOJA","syncTimestamp":1552106140666,"productTitle":"dodocool USB C Hub

        doesn't put into reviews[], should change ]} that to [{"
        */
      methods
        .saveReviews(reviewsScraped, this.state.config.fetchURL)
        .then(() => {
          reviewStorage
            .get("reviews")
            .then(reviews => {
              this.setState(
                {
                  reviews: reviews
                },
                () => {
                  console.log(this.state.reviews.length);
                }
              );
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("scrapeComplete", (event, duration) => {
      this.setState({
        config: {
          ...this.state.config,
          scrapeStatus: `Scraping completed after ${methods.round(
            duration / 1000,
            1
          )} s`,
          isScrapingComplete: false,
          isScrapingPartially: false
        }
      });
    });
    ipcRenderer.on("scrapeError", (event, message) => {
      console.error(message);
      this.setState({
        config: {
          ...this.state.config,
          scrapeStatus: message,
          isScrapingComplete: false,
          isScrapingPartially: false
        }
      });
    });
  }

  render() {
    //@TODO: add statistics view (Time scale when you publish most often, time scale over the last year, ARAT stats?) Take icon from reviewers place, change that to Siegertreppchen

    return (
      <Router>
        <div className="App">
          <Sidebar
            user={this.state.users.find(user =>
              this.state.config.fetchURL.includes(user.id)
            )}
            config={this.state.config}
            startCrawlClickHandler={this.startCrawlClickHandler.bind(this)}
          />
          <div className="nav">
            <NavLink exact to="/" className="link" activeClassName="selected">
              <i className="material-icons">history</i>
            </NavLink>
            <NavLink to="/reviews" className="link" activeClassName="selected">
              <i className="material-icons">list</i>
            </NavLink>
            <NavLink
              to="/statistics"
              className="link"
              activeClassName="selected"
            >
              <i className="material-icons">equalizer</i>
            </NavLink>
            <NavLink to="/settings" className="link" activeClassName="selected">
              <i className="material-icons">settings</i>
            </NavLink>
          </div>
          <div className="main">
            <Switch>
              <Route
                exact
                path="/"
                render={() => <History config={this.state.config} />}
              />
              <Route
                path="/reviews"
                render={() => (
                  <ReviewsList
                    reviews={this.state.reviews}
                    config={this.state.config}
                  />
                )}
              />
              <Route
                path="/settings"
                render={() => (
                  <Settings
                    config={this.state.config}
                    saveNewFetchURL={this.saveNewFetchURL}
                  />
                )}
              />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }

  componentDidMount() {
    this.initAppFromStorage().then(() => {
      this.validateFetchURL(this.state.config.fetchURL);
    });
  }

  //@TODO: Implement autorefresh of profile at App-start / profile-URL change
  startCrawlClickHandler(maxReviewNumber, onlyProfile = false) {
    ipcRenderer.send("startCrawl", {
      url: this.state.config.fetchURL,
      maxReviewNumber: maxReviewNumber,
      onlyProfile
    });
    this.setState({
      config: {
        ...this.state.config,
        scrapeStatus: "Scraping... ",
        isScrapingComplete: maxReviewNumber === 99999,
        isScrapingPartially: maxReviewNumber !== 99999
      }
    });

    logStorage
      .get("crawls")
      .then(crawls => {
        logStorage
          .set("crawls", [
            ...crawls,
            { timestamp: new Date().getTime(), onlyProfile, maxReviewNumber }
          ])
          .then(() => {
            logStorage
              .get("crawls")
              .then(crawls => console.log("crawls", crawls));
          });
      })
      .catch(err => console.error(err));
  }

  async validateFetchURL(url) {
    await this.setState({
      config: {
        ...this.state.config,
        fetchURLGetsValidated: url,
        fetchURLValid: !!methods.fetchURLData(url)
      }
    });
    console.log(
      "..." + url.substring(url.length - 28),
      "valid?",
      this.state.config.fetchURLValid
    );
  }

  saveNewFetchURL = async event => {
    // events get nullified after first processing round and are not available to async functions
    // have to be saved if they should be processed further (here in callback after setState)
    const url = event.target.value;
    await this.validateFetchURL(url);
    if (this.state.config.fetchURLValid) {
      //@TODO: Fetch profile when new URL is specified. Maybe configurable in settings if that should happen. Can lead to faster blocking by Amazon
      //@TODO: Save profiles to fetchedData, too, with history
      this.setState(
        {
          config: {
            ...this.state.config,
            fetchURL: url
          }
        },
        () => {
          configStorage.set("fetchURL", url);
          this.startCrawlClickHandler(10, true);
        }
      );
    }
  };

  async initAppFromStorage() {
    if (!this.state.config.appInitStarted) {
      this.setState({
        config: {
          ...this.state.config,
          appInitStarted: true
        }
      });

      console.log("AppInit start");
      await configStorage
        .get("fetchURL")
        .then(fetchURL => {
          this.setState({
            config: {
              ...this.state.config,
              fetchURL: methods.fetchURLData(fetchURL).profileURL
            }
          });
        })
        .catch(err =>
          console.log("Trying to read file: No reviews safed to disk so far")
        );

      await reviewStorage
        .get("reviews")
        .then(reviews => {
          this.setState({ reviews: reviews });
        })
        .catch(err =>
          console.log("Trying to read file: No reviews safed to disk so far")
        );

      await userStorage
        .get("users")
        .then(users => {
          this.setState({ users: users });
        })
        .catch(err =>
          console.log("Trying to read file: No users safed to disk so far")
        );

      console.log("AppInit end");
    } else {
      console.log("AppInit already started");
    }
  }
}

const mapStateToProps = state => {
  return {
    config: state.config,
    users: state.users,
    reviews: state.reviews
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUserName: name => {
      dispatch({
        type: "SET_USER_NAME",
        payload: name
      });
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
