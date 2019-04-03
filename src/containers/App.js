import React, { Component } from "react";
import { Route, NavLink, Switch, BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import { Sidebar } from "../components/Sidebar";
import { ReviewsList } from "../components/pages/ReviewsList";
import { History } from "../components/pages/History";
import { Users } from "../components/pages/Users";
import { Settings } from "../components/pages/Settings";
import { Statistics } from "../components/pages/Statistics";
import { methods } from "../utilities/methods";
import { reviewStorage, userStorage, configStorage, logStorage } from "../utilities/Storage";

//Electron connected functions
const { ipcRenderer, shell } = window.require("electron");

const initialValues = {
  sortReviewsBy: 'date',
  sortReviewsAscending: false
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        fetchURL: "",
        maxReviewNumberOnPartScrape: 100,
        language: 'en',
        languagesAvailable: [{short: 'en', long:'English'}, {short: 'de', long:'Deutsch'}],
        defaultToastDuration: 95000,
        maxToastsCountVisible : 9,
        saveMessageAfterDuration: 2000,
        sortReviewsBy: initialValues.sortReviewsBy,
        sortReviewsAscending: initialValues.sortReviewsAscending
      },
      status:{
        fetchURLGetsValidated: "",
        fetchURLValid: false,
        crawlNumberValid: false,
        scrapeStatus: "-",
        scrapeProgress: 0,
        isScrapingFull: false,
        isScrapingPartially: false,
        isScrapingProfile: false,
        isScrapingOldOnes: false,
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
        .saveUser(profile, this.state.users)
        .then(() => {
          userStorage
            .get("users")
            .then(users => {
              this.setState({ users: methods.arr2UserClassArr(users) },
                () => {
                  console.log("usersAfterProfileCrawl", this.state.users)
                  this.newToast('success', `Profile fetched: ${profile.name}`)
                }
              )
            })
            .catch(err => console.error(err));
        })
        .catch(err => {
          console.error(err)
          this.newToast('error', `${err}`)
        });
    });
    ipcRenderer.on("reviewsScrapedSoFar", (event, reviewsCount) => {
      //@TODO: Save reviews scraped so far, to get newest reviews if Amazon blocks
      // Also to directly show user new loaded reviews. Has not to wait until all are loaded
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
                this.newToast('error', `Scraping interrupted. Crawled reviews: ${newReviews.length.toLocaleString(this.state.config.language)}`)
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
                  this.newToast('success', `Reviews loaded: ${reviewsScraped.length.toLocaleString(this.state.config.language)}`)
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
          scrapeStatus: "Scrape completed",
          isScrapingFull: false,
          isScrapingPartially: false,
          isScrapingProfile: false
        }
      },() => {
        this.newToast('notification', `Fetch completed after ${methods.round(duration / 1000, 1).toLocaleString(this.state.config.language)} s`)
      });
    });
    ipcRenderer.on("scrapeWarning", (event, message) => {
      this.newToast('warning', message)
      this.setState({
        status: {
          ...this.state.status,
          scrapeStatus: message,
          isScrapingFull: false,
          isScrapingPartially: false,
          isScrapingProfile: false
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
          isScrapingFull: false,
          isScrapingPartially: false,
          isScrapingProfile: false
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
            <NavLink to="/users" className="link" activeClassName="selected">
              <i className="material-icons">face</i>
            </NavLink>
            <NavLink to="/settings" className="link" activeClassName="selected">
              <i className="material-icons">settings</i>
            </NavLink>
          </div>
          <div className="main">
            <Switch>
              <Route exact path="/" render={() => <History config={this.state.config} status={this.state.status} reviews={this.state.reviews} />} />
              <Route path="/reviews" render={() => <ReviewsList reviews={this.state.reviews} config={this.state.config} status={this.state.status} reviewFunctions={this.reviewFunctions} /> } />
              <Route path="/users" render={() => <Users config={this.state.config} status={this.state.status} users={this.state.users} selectUser={this.selectUser} saveNewFetchURL={this.saveNewFetchURL} /> } />
              <Route path="/settings" render={() => <Settings config={this.state.config} status={this.state.status} settingsFunctions={this.settingsFunctions} /> } />
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
  //Handler can crawl full (maxReviewNumber = null), partially (maxReviewNumber != null), only profileStats and can begin at/after a specific review = {externalId, date}
  startCrawlClickHandler({maxReviewNumber = null, onlyProfile = false, startAfterReview = null} = {}) {
    if(onlyProfile) maxReviewNumber = 0

    ipcRenderer.send("startCrawl", {
      url: this.state.config.fetchURL,
      maxReviewNumber: maxReviewNumber,
      onlyProfile,
      startAfterReview
    });
    this.setState({
      status: {
        ...this.state.status,
        scrapeStatus: "Scraping... ",
        isScrapingFull: maxReviewNumber === null,
        isScrapingPartially: !!maxReviewNumber,
        isScrapingProfile: onlyProfile,
        isScrapingOldOnes: !!startAfterReview
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
    sortBy : header =>  {
      // Be able to click through sort states: desc > asc > initialValue
      let asc = initialValues.sortReviewsAscending;
      let sort = header;

      if(this.state.config.sortReviewsBy === header){
        if(this.state.config.sortReviewsAscending === !initialValues.sortReviewsAscending){
          sort = initialValues.sortReviewsBy;
        }
        else asc = !this.state.config.sortReviewsAscending;
      }      
      
      this.setState({
        config : {
          ...this.state.config,
          sortReviewsBy: sort,
          sortReviewsAscending: asc
        }
      })
    },

    idSelected : (reviewId) => {
      console.log(reviewId)
    },
    reviewSelected : (review) => {
      if(!review.selected){
        console.log("opened modal of review");
        console.log("selected review:", review)
      }
      this.setState({
        reviews: [...this.state.reviews].map(r => r.externalId === review.externalId? {...r, selected: !r.selected} : {...r, selected: false})
      })

    },
    idSelected: reviewID => {
      console.log('reviewID selected:', reviewID);
      shell.openExternal(methods.fetchURLData(this.state.config.fetchURL).reviewBaseURL + reviewID);
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
      this.setState(
        {
          config: {
            ...this.state.config,
            fetchURL: url
          }
        },
        () => {
          configStorage.set("fetchURL", url);
          this.startCrawlClickHandler({onlyProfile: true});
        }
      );
      if(this.saveFetchUrlTimer){
        clearTimeout(this.saveFetchUrlTimer)
      }
      this.saveFetchUrlTimer = setTimeout(() => {
        this.newToast('notification', `Fetch URL saved`)
        this.saveFetchUrlTimer = null
      }, this.state.config.saveMessageAfterDuration)
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

  settingsFunctions = {
    saveLanguage : async language => {
      this.newToast('notification', `Language saved: ${language.long}`, 2000)
      this.setState(
        {
          config: {
            ...this.state.config,
            language: language.short
          }
        },
        () => {
          configStorage.set("language", language.short);
        }
      );
    },
  
    saveNewPartialCrawlNumber : async event => {
      const crawlNumber = +event.target.value;
      await this.validatePartialCrawlNumber(crawlNumber);
      if (this.state.status.crawlNumberValid) {
        if(this.saveCrawlNumberTimer){
          clearTimeout(this.saveCrawlNumberTimer)
        }
        this.saveCrawlNumberTimer = setTimeout(() => {
          this.newToast('notification', `Partial crawl number saved: ${crawlNumber.toLocaleString(this.state.config.language)}`)
          this.saveCrawlNumberTimer = null
        }, this.state.config.saveMessageAfterDuration)
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
    }
  }

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
        .getMulti(["language", "fetchURL", "maxReviewNumberOnPartScrape"])
        .then(configStore => {
          this.setState({
            config: {
              ...this.state.config,
              language: configStore.language || this.state.config.language,
              fetchURL: methods.fetchURLData(configStore.fetchURL).profileURL,
              maxReviewNumberOnPartScrape: configStore.maxReviewNumberOnPartScrape || this.state.config.maxReviewNumberOnPartScrape
            }
          },() => {
            console.log('Fetched Config :', this.state.config);
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

    await this.setState({
      status:{
        ...this.state.status,
        toasts:[
          {
            id: maxId + 1,
            type: type,
            message: message,
            dismissed: false
          },
            ...this.state.status.toasts
          ]
        }
      },() => {
        setTimeout(() => {
          this.dismissToast(maxId + 1)
        }, duration);
      }
    )
    // Dismiss toasts if there are too many in the sidebar
    let toastsCount = this.state.status.toasts.length;
    for (let index = 0; index < toastsCount - this.state.config.maxToastsCountVisible; index++) {
      this.dismissToast(this.state.status.toasts[toastsCount - 1 - index].id);
    }
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
