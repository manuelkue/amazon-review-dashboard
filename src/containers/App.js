import React, { Component, Suspense, lazy } from "react";
import { Route, NavLink, Switch, BrowserRouter as Router } from "react-router-dom";
import "./App.css";

import { Sidebar } from "../components/Sidebar";
import { methods } from "../utilities/methods";
import { reviewStorage, userStorage, configStorage, logStorage } from "../utilities/Storage";
import { ModalContainer } from "../components/ModalContainer";
import { ModalReview } from "../components/ModalReview";
import { Loading } from "../components/Loading";

const History = lazy(() => import('../components/pages/History'))
const ReviewsList = lazy(() => import('../components/pages/ReviewsList'))
const Users = lazy(() => import('../components/pages/Users'))
const Settings = lazy(() => import('../components/pages/Settings'))
const Statistics = lazy(() => import('../components/pages/Statistics'))

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
        defaultToastDuration: 5000,
        maxToastsCountVisible : 9,
        saveMessageAfterDuration: 2000,
        sortReviewsBy: initialValues.sortReviewsBy,
        sortReviewsAscending: initialValues.sortReviewsAscending,
        localeDateOptions: {year: '2-digit', month: '2-digit', day: '2-digit' },
        amazonPartnerTag: 'reviewdashboard-21'
      },
      status:{
        fetchURLGetsValidated: "",
        fetchURLValid: false,
        crawlNumberValid: false,
        scrapeStatus: "-",
        scrapeProgress: 0,
        scrapeCountToReach: 0,
        isScrapingFull: false,
        isScrapingPartially: false,
        isScrapingProfile: false,
        isScrapingContinued: false,
        appInitStarted: false,
        appInitFinished: false,
        toasts: [],
        modals: []
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

      const activeUser = this.state.users.find(user => this.state.config.fetchURL.includes(user.id));
      let crawlOffset = 0;
      if(this.state.status.isScrapingContinued){
        crawlOffset = this.state.reviews.filter(review => review.userId === activeUser.id).findIndex(review => review.externalId === activeUser.scrapeIncompleteAfterReviewId)
      }
      console.log('Starting at #', crawlOffset, "of", activeUser.reviewsCount, 'reviews');

      this.setState({
        status: {
          ...this.state.status,
          scrapeProgress:
            activeUser.reviewsCount ?
              methods.round(((reviewsCount + crawlOffset) * 100) / (this.state.status.scrapeCountToReach),0)
              :
              0
        }
      });
      console.log("ScrapeProgress", this.state.status.scrapeProgress);
    });
    ipcRenderer.on("reviewsScrapedInterrupted", (event, {newReviews, userProfileURL}) => {
      // @TODO show the user that only partially fetched and how much, !!!!Toast erzeugen!!!!!
      methods
        .saveReviews(newReviews, this.state.reviews, userProfileURL)
        .then(() => {
          reviewStorage
            .get("reviews")
            .then(reviews => {
              this.setState({
                reviews: methods.arr2ReviewClassArr(reviews)
              }, () => {
                this.saveScrapeIncompleteData(methods.fetchURLData(userProfileURL).id, newReviews[newReviews.length-1].externalId, +new Date().getTime());
                this.newToast('error', `Scraping interrupted. Crawled reviews: ${newReviews.length.toLocaleString(this.state.config.language)}`);
                this.crawlCommentsCounts(userProfileURL, newReviews)
              });
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    });
    ipcRenderer.on("reviewsScraped", (event, {reviewsScraped, userProfileURL}) => {
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
                  this.saveScrapeIncompleteData(methods.fetchURLData(userProfileURL).id, '', 0)
                  this.newToast('success', `Reviews loaded: ${reviewsScraped.length.toLocaleString(this.state.config.language)}`)
                  this.crawlCommentsCounts(userProfileURL, reviewsScraped)
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
    ipcRenderer.on("commentsCrawled", (event, crawledCommentsCounts) => {
      console.log('fetching comments for reviews :', crawledCommentsCounts);

      const reviewsWithCommentCounts = crawledCommentsCounts.map(count => {
        return {...this.state.reviews.find(item => item.externalId === count.reviewId), comments: count.commentsCount}
      })

      setTimeout(() => {
        methods
          .saveReviews(reviewsWithCommentCounts, this.state.reviews, this.state.config.fetchURL, true)
          .then(() => {
            reviewStorage
              .get("reviews")
              .then(reviews => {
                this.setState(
                  {
                    reviews: methods.arr2ReviewClassArr(reviews)
                  },
                  () => {
                    this.newToast('success', `Comments loaded.`)
                  }
                );
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      }, 0);
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
    const userReviews = [...this.state.reviews.filter(review => this.state.config.fetchURL.includes(review.userId))]
    return (
      <Router>
        {this.state.status.appInitFinished &&
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
                <Route exact path="/" render={() =>
                    <Suspense fallback={<Loading/>}>
                      <History
                        config={this.state.config}
                        status={this.state.status}
                        reviews={userReviews}
                        reviewFunctions={this.reviewFunctions}
                      />
                    </Suspense>
                  } />
                <Route path="/reviews" render={() =>
                    <Suspense fallback={<Loading/>}>
                      <ReviewsList
                        reviews={userReviews}
                        config={this.state.config}
                        status={this.state.status}
                        reviewFunctions={this.reviewFunctions}
                      />
                    </Suspense>
                  } />
                <Route path="/users" render={() =>
                    <Suspense fallback={<Loading/>}>
                      <Users
                        config={this.state.config}
                        status={this.state.status}
                        users={this.state.users}
                        selectUser={this.selectUser}
                        saveNewFetchURL={this.saveNewFetchURL}
                      />
                    </Suspense>
                  } />
                <Route path="/settings" render={() =>
                    <Suspense fallback={<Loading/>}>
                      <Settings
                        config={this.state.config}
                        status={this.state.status}
                        settingsFunctions={this.settingsFunctions}
                        crawlCommentsCounts={this.crawlCommentsCounts.bind(this)}
                      />
                    </Suspense>
                  } />
                <Route path="/statistics" render={() =>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Statistics
                        config={this.state.config}
                        status={this.state.status}
                        reviews={userReviews}
                        users={this.state.users}
                      />
                    </Suspense>
                  } />
              </Switch>
            </div>
            { this.state.status.modals.length?
                <ModalContainer config={this.state.config} modals={this.state.status.modals} closeModal={this.closeModal.bind(this)} />
              : null }
          </div>
        }
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
  //Handler can crawl full (maxReviewNumber = null), partially (maxReviewNumber != null), only profileStats and can begin at/after a specific review = externalId
  startCrawlClickHandler({isFullScrape = false, maxReviewNumber = null, onlyProfile = false, startAfterReviewId = null} = {}) {

    if (startAfterReviewId) isFullScrape = true;

    let scrapeCountToReach = this.state.config.maxReviewNumberOnPartScrape;
    if(isFullScrape) scrapeCountToReach = this.state.users.find(user => this.state.config.fetchURL.includes(user.id)).reviewsCount;

    ipcRenderer.send("startCrawl", {
      url: this.state.config.fetchURL,
      isFullScrape,
      maxReviewNumber,
      onlyProfile,
      startAfterReview: this.state.reviews.find(review => review.externalId === startAfterReviewId)
    });
    this.setState({
      status: {
        ...this.state.status,
        scrapeStatus: "Scraping... ",
        scrapeProgress: 0,
        scrapeCountToReach: scrapeCountToReach,
        isScrapingFull: isFullScrape,
        isScrapingPartially: !!maxReviewNumber,
        isScrapingProfile: onlyProfile,
        isScrapingContinued: !!startAfterReviewId
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

    reviewSelected : async (event) => {
      event.persist()
      const reviewId = methods.findFirstIdOfTarget(event.target)
      const review = this.state.reviews.find(review => review.externalId === reviewId)

      if(event.target.className.split(" ").includes('externalLink')){
        shell.openExternal(methods.createURL(this.state.config, {reviewID: reviewId}));
      }else if(!review.selected){
        await this.addModal(methods.getProductTitle(review), <ModalReview review={review} config={this.state.config} reviewFunctions={this.reviewFunctions} copyToClipboard={this.copyToClipboard.bind(this)}/>)
        console.log("selected review:", review)
      }
      this.setState({
        reviews: [...this.state.reviews].map(r => r.externalId === review.externalId? {...r, selected: !r.selected} : {...r, selected: false})
      })

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

      setTimeout(() => {
        this.setState({
          status: {
            ...this.state.status,
            appInitFinished: true
          }
        }, () => console.log("AppInitFinished"));
      }, 0);
    } else {
      console.log("AppInit already started");
    }
  }

  saveScrapeIncompleteData(userId, afterReviewId, atDate){
    const users = [...this.state.users];
    const activeUser = users.find(user => user.id === userId);
    activeUser.scrapeIncompleteAfterReviewId = afterReviewId;
    activeUser.scrapeIncompleteAtDate = atDate;

    this.setState({
      users: users
    }, () => {
      userStorage.set("users", users)
    })
  }

  crawlCommentsCounts(userProfileURL = this.state.config.fetchURL, reviewsToCrawlCommentsFrom = this.state.reviews.filter(review => this.state.config.fetchURL.includes(review.userId))){
    ipcRenderer.send("crawlComments", {userProfileURL, reviewIds: reviewsToCrawlCommentsFrom.map(review => review.externalId)});
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

  async addModal(title, content){
    // Content can be another component or just normal text / jsx
    const maxId = Math.max(...(this.state.status.modals.map(modal => modal.id)), -1)
    if(title && content){
      await this.setState({
        status:{
          ...this.state.status,
          modals:[
            ...this.state.status.modals,
            {
              id: maxId + 1,
              title: title,
              content
            }
            ]
          }
        }
      )
    }else{
      console.error('Modal: Title or Content invalid');
    }
  }

  closeModal = async (event) => {
    event.persist()
    const {id} = event.target

    if(id.length === 0) return

    await this.setState({
      status:{
        ...this.state.status,
        modals: id === 'modal-container' ? [] : [...this.state.status.modals].filter(m => m.id !== +id)
      }
    })
  }

  async copyToClipboard(string){
    methods.copyToClipboard(string)
    await this.newToast('notification', <span className="truncateString">Copied: {string}</span>, 2500)
  }
}
