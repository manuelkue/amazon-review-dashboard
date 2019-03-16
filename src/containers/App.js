import React, { Component } from "react";
import { Route, NavLink, Switch, BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import { Sidebar } from "../components/Sidebar";
import { ReviewsList } from "../components/pages/ReviewsList";
import { History } from "../components/pages/History";
import { Settings } from "../components/pages/Settings";
import { Statistics } from "../components/pages/Statistics";
import { methods } from "../utilities/methods";
import { reviewStorage, userStorage, configStorage, logStorage } from "../utilities/Storage";

const { ipcRenderer } = window.require("electron");

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        fetchURL: "",
        maxReviewNumberOnPartScrape: 100,
        defaultToastDuration: 15000,
        sortReviewsBy: 'date',
        sortReviewsAscending: false
      },
      status:{
        fetchURLGetsValidated: "",
        fetchURLValid: false,
        crawlNumberValid: false,
        scrapeStatus: "-",
        scrapeProgress: 0,
        isScrapingComplete: false,
        isScrapingPartially: false,
        appInitStarted: false,
        toasts: []
      },
      users: [],
      reviews: []
    };

    let saveCrawlNumberTimer = null;
    let saveFetchUrlTimer = null;

    //@TODO: Edit maxReviewNumber of partially fetched in Settings
    //@TODO: Function to click on reviewHeaders and change this.state.config.sortReviewsBy:'helpfulVotes', ...sortReviewsAscending:false

    ipcRenderer.on("profileScraped", (event, profile) => {
      methods
        .saveUser(profile, this.state.users, this.state.config.fetchURL)
        .then(() => {
          userStorage
            .get("users")
            .then(users => {
              this.setState({ users: methods.arr2UserClassArr(users) },
                () => {
                  console.log("usersAfterProfileCrawl", this.state.users)
                  this.newToast('success', `Profile loaded: ${profile.name}`)
                }
              )
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("reviewsScrapedSoFar", (event, reviewsCount) => {
      //@TODO: Save reviews scraped so far, to get newest reviews if Amazon blocks
      this.setState({
        status: {
          ...this.state.status,
          scrapeProgress:
            this.state.users.find(user => this.state.config.fetchURL.includes(user.id)).reviewsCount ?
              methods.round((reviewsCount * 100) / this.state.users.find(user => this.state.config.fetchURL.includes(user.id)).reviewsCount,0)
              :
              0
        }
      });
      console.log("ScrapeProgress", this.state.status.scrapeProgress);
    });
    ipcRenderer.on("reviewsScrapedInterrupted", (event, newReviews) => {
      // @TODO show the user that only partially fetched and how much, !!!!Toast erzeugen!!!!!
      methods
        .saveReviews(newReviews, this.state.reviews, this.state.config.fetchURL)
        .then(() => {
          reviewStorage
            .get("reviews")
            .then(reviews => {
              this.setState({
                reviews: methods.arr2ReviewClassArr(reviews)
              }, () => {
                this.newToast('error', `Scraping interrupted. Crawled reviews: ${newReviews.length}`)
              });
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("reviewsScraped", (event, reviewsScraped) => {
      console.log("reviews", reviewsScraped);
      methods
        .saveReviews(reviewsScraped, this.state.reviews, this.state.config.fetchURL)
        .then(() => {
          reviewStorage
            .get("reviews")
            .then(reviews => {
              this.setState(
                {
                  reviews: methods.arr2ReviewClassArr(reviews)
                },
                () => {
                  this.newToast('success', `Reviews loaded: ${reviewsScraped.length}`)
                }
              );
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("scrapeComplete", (event, duration) => {
      this.setState({
        status: {
          ...this.state.status,
          isScrapingComplete: false,
          isScrapingPartially: false
        }
      });
      this.newToast('notification', `Fetch completed after ${methods.round(duration / 1000, 1)} s`)
    });
    ipcRenderer.on("scrapeWarning", (event, message) => {
      this.newToast('warning', message)
      this.setState({
        status: {
          ...this.state.status,
          scrapeStatus: message,
          isScrapingComplete: false,
          isScrapingPartially: false
        }
      });
    });
    ipcRenderer.on("scrapeError", (event, message) => {
      console.error(message);
      this.newToast('error', message)
      this.setState({
        status: {
          ...this.state.status,
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
            status={this.state.status}
            startCrawlClickHandler={this.startCrawlClickHandler.bind(this)}
            dismissToast={this.dismissToast.bind(this)}
          />
          <div className="nav">
            <NavLink exact to="/" className="link" activeClassName="selected">
              <i className="material-icons">history</i>
            </NavLink>
            <NavLink to="/reviews" className="link" activeClassName="selected">
              <i className="material-icons">list</i>
            </NavLink>
            <NavLink to="/statistics" className="link" activeClassName="selected">
              <i className="material-icons">equalizer</i>
            </NavLink>
            <NavLink to="/settings" className="link" activeClassName="selected">
              <i className="material-icons">settings</i>
            </NavLink>
          </div>
          <div className="main">
            <Switch>
              <Route exact path="/" render={() => <History config={this.state.config} status={this.state.status} reviews={this.state.reviews} />} />
              <Route path="/reviews" render={() => <ReviewsList reviews={this.state.reviews} config={this.state.config} status={this.state.status} reviewFunctions={this.reviewFunctions} /> } />
              <Route path="/settings" render={() => <Settings config={this.state.config} status={this.state.status} users={this.state.users} selectUser={this.selectUser} saveNewFetchURL={this.saveNewFetchURL} saveNewPartialCrawlNumber={this.saveNewPartialCrawlNumber} /> } />
              <Route path="/statistics" render={() => <Statistics config={this.state.config} status={this.state.status} reviews={this.state.reviews} users={this.state.users} /> } />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }

  componentDidMount() {
    this.initAppFromStorage().then(() => {
      this.state.config.fetchURL && this.validateFetchURL(this.state.config.fetchURL);
      this.state.config.maxReviewNumberOnPartScrape && this.validatePartialCrawlNumber(this.state.config.maxReviewNumberOnPartScrape);
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
      status: {
        ...this.state.status,
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

  reviewFunctions = {
    idSelected : (reviewId) => {
      console.log(reviewId)
    },
    selected : (review) => {
      this.setState({
        reviews: [...this.state.reviews].map(r => r.externalId === review.externalId? {...r, selected: !r.selected} : {...r, selected: false})
      })
      console.log(review, "selected:", review.selected)
    }
  }

  selectUser = (user) => {
    console.log("selected", user.name)
    this.saveNewFetchURL({target:{value: user.profileURL}})
  }

  saveNewFetchURL = async event => {
    // events get nullified after first processing round and are not available to async functions
    // have to be saved if they should be processed further (here in callback after setState)
    const url = event.target.value;
    await this.validateFetchURL(url);
    if (this.state.status.fetchURLValid) {
      //@TODO: Fetch profile when new URL is specified. Maybe configurable in settings if that should happen. Can lead to faster blocking by Amazon
      if(this.saveFetchUrlTimer){
        clearTimeout(this.saveFetchUrlTimer)
      }
      this.saveFetchUrlTimer = setTimeout(() => {
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
        this.newToast('notification', `Fetch URL saved`)
        this.saveFetchUrlTimer = null
      }, 3000)
    }
  };

  async validateFetchURL(url) {
    await this.setState({
      status: {
        ...this.state.status,
        fetchURLGetsValidated: url,
        fetchURLValid: !!methods.fetchURLData(url)
      }
    });
    console.log(
      "..." + url.substring(url.length - 28),
      "valid?",
      this.state.status.fetchURLValid
    );
  }

  saveNewPartialCrawlNumber = async event => {
    const crawlNumber = +event.target.value;
    await this.validatePartialCrawlNumber(crawlNumber);
    if (this.state.status.crawlNumberValid) {
      if(this.saveCrawlNumberTimer){
        clearTimeout(this.saveCrawlNumberTimer)
      }
      this.saveCrawlNumberTimer = setTimeout(() => {
        this.newToast('notification', `Partial crawl number saved: ${crawlNumber}`)
        this.saveCrawlNumberTimer = null
      }, 3000)
      this.setState(
        {
          config: {
            ...this.state.config,
            maxReviewNumberOnPartScrape: crawlNumber
          }
        },
        () => {
          configStorage.set("maxReviewNumberOnPartScrape", crawlNumber);
        }
      );
    }
  };

  async validatePartialCrawlNumber(crawlNumber) {
    await this.setState({
      status: {
        ...this.state.status,
        maxReviewNumberOnPartScrapeGetsValidated: +crawlNumber,
        crawlNumberValid: !isNaN(+crawlNumber)
      }
    });
    console.log(
      "crawlNumber", crawlNumber,
      "valid?",
      this.state.status.crawlNumberValid
    );
  }

  async initAppFromStorage() {
    if (!this.state.status.appInitStarted) {
      this.setState({
        status: {
          ...this.state.status,
          appInitStarted: true
        }
      });

      console.log("AppInit start");
      await configStorage
        .getMulti(["fetchURL", "maxReviewNumberOnPartScrape"])
        .then(result => {
          this.setState({
            config: {
              ...this.state.config,
              fetchURL: methods.fetchURLData(result[0]).profileURL,
              maxReviewNumberOnPartScrape: result[1]
            }
          },() => {
            console.log('result :', result);
            console.log('maxReviewNumberOnPartScrape :', this.state.config.maxReviewNumberOnPartScrape);
          });
        })
        .catch(err =>
          console.log("Trying to read file: Error while reading config\n",err)
        );

      await reviewStorage
        .get("reviews")
        .then(reviews => {
          this.setState({ reviews: methods.arr2ReviewClassArr(reviews) });
        })
        .catch(err =>
          console.log("Trying to read file: No reviews safed to disk so far\n",err)
        );

      await userStorage
        .get("users")
        .then(users => {
          this.setState({ users: methods.arr2UserClassArr(users) });
        })
        .catch(err =>
          console.log("Trying to read file: No users safed to disk so far\n",err)
        );

      console.log("AppInit end");
    } else {
      console.log("AppInit already started");
    }
  }

  async newToast(type, message, duration = this.state.config.defaultToastDuration){
    const maxId = Math.max(...(this.state.status.toasts.map(toast => toast.id)), -1)
    console.log(this.state.status);

    await this.setState({
      status:{
        ...this.state.status,
        toasts:[
            ...this.state.status.toasts,
            {
              id: maxId + 1,
              type: type,
              message: message,
              dismissed: false
            }
          ]
        }
      },() => {
        setTimeout(() => {
          this.dismissToast(maxId + 1)
        }, duration);
      }
    )
  }

  async dismissToast(id){
    if(this.state.status.toasts.find(toast => toast.id === id)){
      await this.setState({
        status:{
          ...this.state.status,
          toasts: [...this.state.status.toasts].map(t => t.id === id? {...t, dismissed: true} : {...t, dismissed: false})
        }
      })
      setTimeout(() => {
        this.setState({
          status:{
            ...this.state.status,
            toasts: [...this.state.status.toasts].filter(t => t.id !== id)
          }
        })
      }, 500)
    }
  }
}
