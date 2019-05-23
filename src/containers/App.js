import React, { Component, Suspense, lazy, useState, useEffect } from "react";
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

export default function App(){

  const [configState, setConfig] = useState({
    fetchURL: "",
    maxReviewNumberOnPartScrape: 100,
    language: 'en',
    languagesAvailable: [{short: 'en', long:'English'}, {short: 'de', long:'Deutsch'}],
    defaultToastDuration: 5000,
    maxToastsCountVisible : 9,
    saveMessageAfterDuration: 2000,
    sortReviewsBy: initialValues.sortReviewsBy,
    sortReviewsAscending: initialValues.sortReviewsAscending
  })

  const [statusState, setStatus] = useState({
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
    appInitFinished: false
  })

  const [modalsState, setModals] = useState([])
  const [toastsState, setToasts] = useState([])
  const [usersState, setUsers] = useState([])
  const [reviewsState, setReviews] = useState([])

  // Hook that behaves like 'Component mounted' - executed at the beginning
  useEffect(() => {
    initAppFromStorage().then(() => {
      configState.fetchURL && validateFetchURL(configState.fetchURL);
      configState.maxReviewNumberOnPartScrape && validatePartialCrawlNumber(configState.maxReviewNumberOnPartScrape);


      ipcRenderer.on("profileScraped", (event, profile) => {
        methods
          .saveUser(profile, usersState)
          .then(() => {
            userStorage
              .get("users")
              .then(async users => {
                await setUsers(methods.arr2UserClassArr(users))
                console.log("usersAfterProfileCrawl", usersState)
                newToast('success', `Profile fetched: ${profile.name}`)
              })
              .catch(err => console.error(err));
          })
          .catch(err => {
            console.error(err)
            newToast('error', `${err}`)
          });
      });
      ipcRenderer.on("reviewsScrapedSoFar", async (event, reviewsCount) => {
        //@TODO: Save reviews scraped so far, to get newest reviews if Amazon blocks
        // Also to directly show user new loaded reviews. Has not to wait until all are loaded

        const activeUser = usersState.find(user => configState.fetchURL.includes(user.id));
        let crawlOffset = 0;
        if(statusState.isScrapingContinued){
          crawlOffset = reviewsState.filter(review => review.userId === activeUser.id).findIndex(review => review.externalId === activeUser.scrapeIncompleteAfterReviewId)
        }
        console.log('Starting at #', crawlOffset, "of", activeUser.reviewsCount, 'reviews');

        await setStatus(prevStatus => ({
          ...prevStatus,
          scrapeProgress:
            activeUser.reviewsCount ?
              methods.round(((reviewsCount + crawlOffset) * 100) / (statusState.scrapeCountToReach),0)
              :
              0
        }));
        console.log("ScrapeProgress", statusState.scrapeProgress);
      });
      ipcRenderer.on("reviewsScrapedInterrupted", (event, {newReviews, userProfileURL}) => {
        // @TODO show the user that only partially fetched and how much, !!!!Toast erzeugen!!!!!
        methods
          .saveReviews(newReviews, reviewsState, userProfileURL)
          .then(() => {
            reviewStorage
              .get("reviews")
              .then(async reviews => {
                await setReviews(methods.arr2ReviewClassArr(reviews))
                saveScrapeIncompleteData(methods.fetchURLData(userProfileURL).id, newReviews[newReviews.length-1].externalId, +new Date().getTime());
                newToast('error', `Scraping interrupted. Crawled reviews: ${newReviews.length.toLocaleString(configState.language)}`);
                crawlCommentsCounts(userProfileURL, newReviews)
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      });
      ipcRenderer.on("reviewsScraped", (event, {reviewsScraped, userProfileURL}) => {
        console.log("reviews", reviewsScraped);
        methods
          .saveReviews(reviewsScraped, reviewsState, configState.fetchURL)
          .then(() => {
            reviewStorage
              .get("reviews")
              .then(async reviews => {
                await setReviews(methods.arr2ReviewClassArr(reviews))
                saveScrapeIncompleteData(methods.fetchURLData(userProfileURL).id, '', 0)
                newToast('success', `Reviews loaded: ${reviewsScraped.length.toLocaleString(configState.language)}`)
                crawlCommentsCounts(userProfileURL, reviewsScraped)
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      });
      ipcRenderer.on("scrapeComplete", async (event, duration) => {
        await setStatus(prevStatus => ({
          ...prevStatus,
          scrapeStatus: "Scrape completed",
          isScrapingFull: false,
          isScrapingPartially: false,
          isScrapingProfile: false
        }))
        newToast('notification', `Fetch completed after ${methods.round(duration / 1000, 1).toLocaleString(configState.language)} s`)
      });
      ipcRenderer.on("commentsCrawled", (event, crawledCommentsCounts) => {
        console.log('fetching comments for reviews :', crawledCommentsCounts);

        const reviewsWithCommentCounts = crawledCommentsCounts.map(count => {
          return {...reviewsState.find(item => item.externalId === count.reviewId), comments: count.commentsCount}
        })

        methods
          .saveReviews(reviewsWithCommentCounts, reviewsState, configState.fetchURL, true)
          .then(() => {
            reviewStorage
              .get("reviews")
              .then(async reviews => {
                await setReviews(methods.arr2ReviewClassArr(reviews))
                newToast('success', `Comments loaded.`)
              })
              .catch(err => console.error(err));
          })
          .catch(err => console.error(err));
      });
      ipcRenderer.on("scrapeWarning", (event, message) => {
        newToast('warning', message)
        setStatus(prevStatus => ({
          ...prevStatus,
          scrapeStatus: message,
          isScrapingFull: false,
          isScrapingPartially: false,
          isScrapingProfile: false
        }))
      });
      ipcRenderer.on("scrapeError", (event, message) => {
        console.error(message);
        newToast('error', message)
        setStatus(prevStatus => ({
            ...prevStatus,
            scrapeStatus: message,
            isScrapingFull: false,
            isScrapingPartially: false,
            isScrapingProfile: false
          }))
      });

    });
  }, [])









  // Effects that have to be executed after state-changes. Formerly executed via callbacks

    const [prevToastsCount, setPrevToastsCount] = useState(0)
    useEffect(() => {
      if(prevToastsCount < toastsState.length){
        const newestToast = toastsState.find(toast => toast.id === methods.maxIdOfObjArr(toastsState))
        setTimeout(() => {
          dismissToast(newestToast.id)
        }, newestToast.duration);

        // Dismiss toasts if there are too many in the sidebar
        let toastsCount = toastsState.length;
        for (let index = 0; index < toastsCount - configState.maxToastsCountVisible; index++) {
          dismissToast(toastsState[toastsCount - 1 - index].id);
        }
      }
      setPrevToastsCount(toastsState.length)
    }, [toastsState.length])










  let saveCrawlNumberTimer = null;
  let saveFetchUrlTimer = null;

  //@TODO: Edit maxReviewNumber of partially fetched in Settings
  //@TODO: Implement autorefresh of profile at App-start / profile-URL change

  //Handler can crawl full (maxReviewNumber = null), partially (maxReviewNumber != null), only profileStats and can begin at/after a specific review = externalId
  const startCrawlClickHandler = ({isFullScrape = false, maxReviewNumber = null, onlyProfile = false, startAfterReviewId = null} = {}) => {

    if (startAfterReviewId) isFullScrape = true;

    let scrapeCountToReach = configState.maxReviewNumberOnPartScrape;
    if(isFullScrape) scrapeCountToReach = usersState.find(user => configState.fetchURL.includes(user.id)).reviewsCount;

    ipcRenderer.send("startCrawl", {
      url: configState.fetchURL,
      isFullScrape,
      maxReviewNumber,
      onlyProfile,
      startAfterReview: reviewsState.find(review => review.externalId === startAfterReviewId)
    });
    setStatus(prevStatus => ({
      ...prevStatus,
      scrapeStatus: "Scraping... ",
      scrapeProgress: 0,
      scrapeCountToReach: scrapeCountToReach,
      isScrapingFull: isFullScrape,
      isScrapingPartially: !!maxReviewNumber,
      isScrapingProfile: onlyProfile,
      isScrapingContinued: !!startAfterReviewId
    }))

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

  const reviewFunctions = {
    sortBy : header =>  {
      // Be able to click through sort states: desc > asc > initialValue
      let asc = initialValues.sortReviewsAscending;
      let sort = header;

      if(configState.sortReviewsBy === header){
        if(configState.sortReviewsAscending === !initialValues.sortReviewsAscending){
          sort = initialValues.sortReviewsBy;
        }
        else asc = !configState.sortReviewsAscending;
      }

      setConfig(prevConfig => ({
        ...prevConfig,
        sortReviewsBy: sort,
        sortReviewsAscending: asc
      }))
    },

    reviewSelected : async (event) => {
      event.persist()
      const reviewId = methods.findFirstIdOfTarget(event.target)
      const review = reviewsState.find(review => review.externalId === reviewId)

      if(event.target.className.split(" ").includes('externalLink')){
        shell.openExternal(methods.fetchURLData(configState.fetchURL).reviewBaseURL + reviewId + '/?tag=reviewdashboard-21');
      }else if(!review.selected){
        await addModal(methods.getProductTitle(review), <ModalReview review={review} copyToClipboard={copyToClipboard.bind(this)}/>)
        console.log("selected review:", review)
      }
      setReviews(prevReviews =>
        [...prevReviews].map(r => r.externalId === review.externalId? {...r, selected: !r.selected} : {...r, selected: false})
        )

    }
  }

  const selectUser = (user) => {
    console.log("selected", user.name)
    saveNewFetchURL({target:{value: user.profileURL}})
  }

  const saveNewFetchURL = async event => {
    // events get nullified after first processing round and are not available to async functions
    // have to be saved if they should be processed further (here in callback after setState)
    const url = event.target.value;
    await validateFetchURL(url);
    if (statusState.fetchURLValid) {
      //@TODO: Fetch profile when new URL is specified. Maybe configurable in settings if that should happen. Can lead to faster blocking by Amazon
      await setConfig(prevConfig => ({
        ...prevConfig,
        fetchURL: url
      }))
      configStorage.set("fetchURL", url);
      startCrawlClickHandler({onlyProfile: true});

      if(saveFetchUrlTimer){
        clearTimeout(saveFetchUrlTimer)
      }
      saveFetchUrlTimer = setTimeout(() => {
        newToast('notification', `Fetch URL saved`)
        saveFetchUrlTimer = null
      }, configState.saveMessageAfterDuration)
    }
  };

  const validateFetchURL = async (url) => {
    await setStatus(prevStatus => ({
        ...prevStatus,
        fetchURLGetsValidated: url,
        fetchURLValid: !!methods.fetchURLData(url)
      }))
    console.log(
      "..." + url.substring(url.length - 28),
      "valid?",
      statusState.fetchURLValid
    );
  }

  const settingsFunctions = {
    saveLanguage : async language => {
      newToast('notification', `Language saved: ${language.long}`, 2000)
      await setConfig(prevConfig => ({
        ...prevConfig,
        language: language.short
      }))
      configStorage.set("language", language.short);
    },

    saveNewPartialCrawlNumber : async event => {
      const crawlNumber = +event.target.value;
      await validatePartialCrawlNumber(crawlNumber);
      if (statusState.crawlNumberValid) {
        if(saveCrawlNumberTimer){
          clearTimeout(saveCrawlNumberTimer)
        }
        saveCrawlNumberTimer = setTimeout(() => {
          newToast('notification', `Partial crawl number saved: ${crawlNumber.toLocaleString(configState.language)}`)
          saveCrawlNumberTimer = null
        }, configState.saveMessageAfterDuration)
        await setConfig(prevConfig => ({
          ...prevConfig,
          maxReviewNumberOnPartScrape: crawlNumber
        }))
        configStorage.set("maxReviewNumberOnPartScrape", crawlNumber);
      }
    }
  }

  const validatePartialCrawlNumber = async (crawlNumber) => {
    await setStatus(prevStatus => ({
      ...prevStatus,
      maxReviewNumberOnPartScrapeGetsValidated: +crawlNumber,
      crawlNumberValid: !isNaN(+crawlNumber)
    }))
    console.log(
      "crawlNumber", crawlNumber,
      "valid?",
      statusState.crawlNumberValid
    );
  }

  const initAppFromStorage = async () => {
    if (!statusState.appInitStarted) {
      setStatus(prevStatus => ({
        ...prevStatus,
        appInitStarted: true
      }))

      console.log("AppInit start");
      await configStorage
        .getMulti(["language", "fetchURL", "maxReviewNumberOnPartScrape"])
        .then(async configStore => {
          await setConfig(prevConfig => ({
            ...prevConfig,
            language: configStore.language || configState.language,
            fetchURL: methods.fetchURLData(configStore.fetchURL).profileURL,
            maxReviewNumberOnPartScrape: configStore.maxReviewNumberOnPartScrape || configState.maxReviewNumberOnPartScrape
          }))
          console.log('Fetched Config :', configState);
        })
        .catch(err =>
          console.log("Trying to read file: Error while reading config\n",err)
        );

      await reviewStorage
        .get("reviews")
        .then(reviews => {
          setReviews(methods.arr2ReviewClassArr(reviews))
        })
        .catch(err =>
          console.log("Trying to read file: No reviews safed to disk so far\n",err)
        );

      await userStorage
        .get("users")
        .then(users => {
          setUsers(methods.arr2UserClassArr(users))
        })
        .catch(err =>
          console.log("Trying to read file: No users safed to disk so far\n",err)
        );

      setTimeout(async () => {
        await setStatus(prevStatus => ({
          ...prevStatus,
          appInitFinished: true
        }))
        console.log("AppInitFinished")
      }, 300);
    } else {
      console.log("AppInit already started");
    }
  }

  const saveScrapeIncompleteData = async (userId, afterReviewId, atDate) => {
    const users = [...usersState];
    const activeUser = users.find(user => user.id === userId);
    activeUser.scrapeIncompleteAfterReviewId = afterReviewId;
    activeUser.scrapeIncompleteAtDate = atDate;

    await setUsers(users)
    userStorage.set("users", users)
  }

  const crawlCommentsCounts = (
    userProfileURL = configState.fetchURL,
    reviewsToCrawlCommentsFrom = reviewsState.filter(review => configState.fetchURL.includes(review.userId))
    ) => {
    ipcRenderer.send("crawlComments", {userProfileURL, reviewIds: reviewsToCrawlCommentsFrom.map(review => review.externalId)});
  }

  const newToast = async (type, message, duration = configState.defaultToastDuration) => {
    let maxId = 0

    await setToasts(prevToasts => {
      maxId = methods.maxIdOfObjArr(prevToasts)
      return [
        {
          id: maxId + 1,
          type,
          message,
          duration,
          dismissed: false
        },
        ...prevToasts
        ]
    })
  }

  const dismissToast = async (id) => {
    console.log('dismissed Toast nr', id);
    if(toastsState.find(toast => toast.id === id)){
      await setToasts(prevToasts => [...prevToasts].map(t => t.id === id? {...t, dismissed: true} : {...t, dismissed: false})
      )
      setTimeout(() => {
        setToasts(prevToasts => [...prevToasts].filter(t => t.id !== id)
        )
      }, 500)
    }
  }

  const addModal = async (title, content) => {
    // Content can be another component or just normal text / jsx
    if(title && content){
      await setModals(prevModals =>
        [
          ...prevModals,
          {
            id: methods.maxIdOfObjArr(prevModals) + 1,
            title,
            content
          }
        ]
      )
    }else{
      console.error('Modal: Title or Content invalid');
    }
  }

  const closeModal = async (event) => {
    event.persist()
    const {id} = event.target

    if(id.length === 0) return

    await setModals(prevModals => id === 'modal-container' ? [] : [...prevModals].filter(m => m.id !== +id))
  }

  const copyToClipboard = async (string) => {
    methods.copyToClipboard(string)
    await newToast('notification', `Copied: ${string}`, 2000)
    await addModal('Copied', string)
  }
















  //@TODO: add statistics view (Time scale when you publish most often, time scale over the last year, ARAT stats?) Take icon from reviewers place, change that to Siegertreppchen
  const userReviews = [...reviewsState.filter(review => configState.fetchURL.includes(review.userId))]
  return (
    <Router>
      {statusState.appInitFinished &&
        <div className="App">
          <Sidebar
            user={usersState.find(user =>
              configState.fetchURL.includes(user.id)
            )}
            config = {configState}
            status = {statusState}
            startCrawlClickHandler = {startCrawlClickHandler.bind(this)}
            toasts = {toastsState}
            dismissToast = {dismissToast.bind(this)}
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
                      config={configState}
                      status={statusState}
                      reviews={userReviews}
                      reviewFunctions={reviewFunctions}
                    />
                  </Suspense>
                } />
              <Route path="/reviews" render={() =>
                  <Suspense fallback={<Loading/>}>
                    <ReviewsList
                      reviews={userReviews}
                      config={configState}
                      status={statusState}
                      reviewFunctions={reviewFunctions}
                    />
                  </Suspense>
                } />
              <Route path="/users" render={() =>
                  <Suspense fallback={<Loading/>}>
                    <Users
                      config={configState}
                      status={statusState}
                      users={usersState}
                      selectUser={selectUser}
                      saveNewFetchURL={saveNewFetchURL}
                    />
                  </Suspense>
                } />
              <Route path="/settings" render={() =>
                  <Suspense fallback={<Loading/>}>
                    <Settings
                      config={configState}
                      status={statusState}
                      settingsFunctions={settingsFunctions}
                      crawlCommentsCounts={crawlCommentsCounts.bind(this)}
                    />
                  </Suspense>
                } />
              <Route path="/statistics" render={() =>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Statistics
                      config={configState}
                      status={statusState}
                      reviews={userReviews}
                      users={usersState}
                    />
                  </Suspense>
                } />
            </Switch>
          </div>
          { modalsState.length?
              <ModalContainer modals={modalsState} closeModal={closeModal.bind(this)} />
            : null }
        </div>
      }
    </Router>
  );


















}
