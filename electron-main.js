const { app, BrowserWindow, ipcMain } = require('electron')
const Storage = require('./src/node-logic/storage');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch')
let mainWindow

const maxCrawlingTime = 300000;
let isCrawlingReviews;
let isCrawlingComments;

const storage = new Storage({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1800, height: 1000 }
  }
});

////////////////////////
// Puppeteer
////////////////////////

//Create browser globally to reference it in Electron window onReady.
let browser;
const headlessMode = true;

ipcMain.on('startCrawl', async (event, startCrawl) => {
  console.log("\n\ncrawling from", startCrawl.url, "\n")
  crawlReviews(startCrawl.url, startCrawl.isFullScrape, startCrawl.maxReviewNumber, startCrawl.onlyProfile, startCrawl.startAfterReview);
})

ipcMain.on('crawlComments', async (event, {userProfileURL, reviewIds}) => {

  const commentsCrawlStartTime = new Date().getTime()

  //Array with objects of {reviewId, commentsCount}
  let commentsCounts = [];
  const crawlCommentsInterval = async () => {
    const currentReviewIds = reviewIds.filter(reviewId => !commentsCounts.map(count => count.reviewId).includes(reviewId)).slice(0, 15)
    await Promise.all(currentReviewIds.map(reviewId => {
      return new Promise((resolve, reject) => {
        getCommentsCount(`https://${new URL(userProfileURL).hostname}/gp/customer-reviews/${reviewId}`)
          .then(commentsCount => {
            commentsCounts.push({reviewId, commentsCount});
            console.log(`Count for review ${reviewId}: ${commentsCount}`);
            resolve(true)
          })
          .catch(err => reject(err))
      })
    }))
    .then(results => {
      console.log(`Count for ${currentReviewIds.length} reviews finished successfull`)
      if(commentsCounts.length !== reviewIds.length) {
        crawlCommentsInterval()
      }
    })
    .catch(err => {
      console.info(err);
      console.log(`Count for reviews finished with ${commentsCounts.length} of ${reviewIds.length}`);
    })

    mainWindow.webContents.send('commentsCrawled', commentsCounts)
    console.log('commentsCrawled after :', new Date().getTime() - commentsCrawlStartTime, 'ms');
  }
  crawlCommentsInterval()
})


async function crawlReviews(userProfileURL, isFullScrape, maxReviewNumber, onlyProfile, startAfterReview){
  console.log('maxReviewNumber :', maxReviewNumber);
  const scrapeStartTime = new Date().getTime()
  isCrawlingReviews = true;
  let reviews = [];

  const page = await browser.newPage()

  await page.setViewport({ width: 500, height: 1000 });

  //Filter for relevant files & fetch json-Data
  await page.setRequestInterception(true);
  page.on('request', req => {
      if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
          req.abort();
      }
      else {
        if (req.resourceType() == 'xhr' && req.url().includes('profilewidget')){
          // That's the request for the needed json-data
        }
          req.continue();
      }
  });

  
  let helpfulVotes, reviewsCount, name, rank 
  
  page.on('response', response => {

    //reading xhr-json-responses (userStats)
    if(response.url().includes('gamification')){
      response.json()
      .then(json => {
        helpfulVotes = +json.helpfulVotes.helpfulVotesData.count.replace(/\D/g,'')
        reviewsCount = +json.reviews.reviewsCountData.count.replace(/\D/g,'')
        if(name && rank) mainWindow.webContents.send('profileScraped', {userProfileURL, name, rank, helpfulVotes, reviewsCount})
        //@TODO: Convert to promises -> Promise.all -> webContents.send
      })
      .catch(err => {
        console.log('gamificationError')
        interruptedByAmazon(err, page)
      })
    }

    //reading xhr-json-responses (reviews)
    if(!onlyProfile && response.url().includes('profilewidget')){
      response.json()
      .then(async responseObj => {

        if(responseObj['contributions'].length){
          const jsonPage = await browser.newPage();
          //Timeout if Amazon blocks, then cancel Crawl
          const timeoutForResponse = 10000;
  
          recursiveJsonCrawl(responseObj);
  
          async function recursiveJsonCrawl(responseObj){
            //@TODO: If no reviews available, fail gracefully
  
            let responseTimout = setTimeout(() => {
              mainWindow.webContents.send('reviewsScrapedInterrupted', {newReviews: reviews, userProfileURL})
              console.log("\n\Timeout at responseObj:\n\n", responseObj);
              interruptedByAmazon('TIMEOUT after ',timeoutForResponse,'ms while crawling', jsonPage)
            }, timeoutForResponse)
  
            reviews.push(...responseObj['contributions']);
            console.log("reviewsCount", reviews.length);
            mainWindow.webContents.send('reviewsScrapedSoFar', reviews.length)
            
            if(!responseObj.nextPageToken || (!isFullScrape && reviews.length >= maxReviewNumber)){
              console.log("\n#############\nScrapeComplete");
              console.log("Total time of crawling", new Date().getTime() - scrapeStartTime, "ms")
              console.log("reviewsCount", reviews.length, "\n\n");
              isCrawlingReviews = false;
              mainWindow.webContents.send('reviewsScraped', {reviewsScraped: reviews, userProfileURL})
              mainWindow.webContents.send('scrapeComplete', new Date().getTime() - scrapeStartTime)
              
              clearTimeout(responseTimout);
              await closeConnection (jsonPage)
            }else{
              //@TODO: Catch if nextPageToken but no JSON delivered / Amazon blocked?
              const jsonURL = makeJsonURL(userProfileURL, responseObj, response, startAfterReview);
              // Reset start after review, so it doesn't get used everytime
              startAfterReview = null;
              console.log("\nnextURL should be\n\n", jsonURL, "\n\n\n")
  
              await hideAutomatedScraping(jsonPage);
              await jsonPage.goto(jsonURL);
              const content = await jsonPage.content(); 
              jsonObj = await jsonPage.evaluate(() =>  {
                  return JSON.parse(document.querySelector("body").innerText); 
              }); 
  
              clearTimeout(responseTimout);
              recursiveJsonCrawl(jsonObj)
            }
          }
        }else{
          //@TODO: Send Message, that user has no reviews visible
          console.log("No public reviews available/visible");
          mainWindow.webContents.send('scrapeWarning', 'No reviews available/visible')
          await closeConnection (page)
        }
      })
      .catch(err => {
        mainWindow.webContents.send('reviewsScrapedInterrupted', reviews)
        console.log('reviewCrawlError')
        interruptedByAmazon(err, page)
      })
    }
  })


  await hideAutomatedScraping(page);
  await page.goto(userProfileURL)
  .then(async () => {
    name = await page.$eval('.name-container span', el => el.innerText)
      .catch(() => console.error('$eval name not successfull'))
    
    rank = await page.$eval('div.deck-container .desktop .a-row .a-section .a-section .a-row .a-column .a-row span.a-size-base', el => el.innerText.replace(/\D/g,''))
      .catch(async () => 
        page.$eval('.a-spacing-base a.a-link-normal', el => +el.getAttribute('href').split('rank=')[1].split('#')[0])
          .catch(() => console.error('$eval rank not successfull'))
      )


    rank = rank || 0;
    if(helpfulVotes && reviewsCount) mainWindow.webContents.send('profileScraped', {userProfileURL, name, rank, helpfulVotes, reviewsCount})
  
  // If no completeCrawl crawling has to be deactivated here
  if (onlyProfile){
    isCrawlingReviews = false
    mainWindow.webContents.send('scrapeComplete',  new Date().getTime() - scrapeStartTime)
    await closeConnection (page)
  }
  console.log("First full load after", new Date().getTime() - scrapeStartTime, "ms")
  })
  .catch(async err => {
    mainWindow.webContents.send('scrapeError', 'Connection failed.\n')
    console.info('Connection failed');
    await closeConnection(page)
  })
}

function makeJsonURL(userProfileURL, responseObj, firstResponse, startAfterReview){

  //Inject startAfterReview into nextPageToken
  if (startAfterReview){
    //Regex finds places, groups them and replaces the groups with $1,...$4
    regex = /(?:({"st":{"n":")(\d+))(.+)(?:(amzn1\.productreview\.))(\w+)/g;
    replace = '$1' + startAfterReview.date + '$3$4' + startAfterReview.externalId;
    responseObj.nextPageToken = responseObj.nextPageToken.replace(regex, replace)
  }
    const jsonURL = ""+
      firstResponse.url().split('nextPageToken=')[0] +
      'nextPageToken=' +
      encodeURIComponent(responseObj.nextPageToken) +
      firstResponse.url().split('nextPageToken=')[1]
      
  return jsonURL;
}

async function interruptedByAmazon(err, page){
  mainWindow.webContents.send('scrapeError', 'Interrupted by Amazon')
  isCrawlingReviews = false;
  await closeConnection (page)
  console.error(err)
}

//@TODO: After reviews are crawled, fetch commmentsCount for each review
async function getCommentsCount(reviewURL){
  const page = await browser.newPage()

  await page.setViewport({ width: 500, height: 1000 });

  //Filter for relevant files & fetch json-Data
  await page.setRequestInterception(true);
  page.on('request', req => {
      if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'xhr'){
          req.abort();
      }
      else {
          req.continue();
      }
  });

  return new Promise(async (resolve, reject) => {
    let commentsCount;
    await hideAutomatedScraping(page);

    await page.goto(reviewURL, { waitUntil: 'load' })
    .then(async () => {
      commentsCount = await page.$eval('span.review-comment-total', el => +el.innerText)
        .catch(() => console.error('$eval count not successfull'))
      await closeConnection (page)
      if(typeof commentsCount === 'number' && commentsCount >= 0 ){
        resolve(+commentsCount)
      }else{
        reject(`Parsing not successfull ${reviewURL}`)
      }
    })
    .catch(async err => {
      mainWindow.webContents.send('scrapeError', 'Connection failed.\n');
      await closeConnection (page)
      reject(`Connection failed for ${reviewURL}`)
    })  
  })
}


async function closeConnection (page){
      try{
        await setTimeout(async () => {
          await page.close();
        },500)
        console.log("connection closed")
      }
      catch{
        console.log("connection already closed")
      }
}

async function hideAutomatedScraping(page){
  // https://intoli.com/blog/not-possible-to-block-chrome-headless/
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
    window.navigator.chrome = {
      ...window.navigator.chrome,
      runtime: {}
    };
    
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}

////////////////////////
// Electron
////////////////////////

// Diese Methode wird aufgerufen, wenn Electron mit der
// Initialisierung fertig ist und Browserfenster erschaffen kann.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.on('ready', async ()=>{
  let { width, height } = storage.get('windowBounds');
  mainWindow = new BrowserWindow({ width, height })

  browser = await puppeteer.launch({ headless: headlessMode })

  // mainWindow.on('resize', () => {
  //   let { width, height } = mainWindow.getBounds();
  //   storage.set('windowBounds', { width, height });
  // });
  
  mainWindow.on('closed', async () => {
    // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
    // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt. 
    // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
    await browser.close();
    mainWindow = null
  })

  //@TODO in production change to load file
  //mainWindow.loadFile('build/index.html')
  mainWindow.loadURL('http://localhost:3000/')
  mainWindow.webContents.openDevTools()
})

// Verlassen, wenn alle Fenster geschlossen sind.
app.on('window-all-closed', () => {
  // Unter macOS ist es üblich für Apps und ihre Menu Bar
  // aktiv zu bleiben bis der Nutzer explizit mit Cmd + Q die App beendet.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
  // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
  if (mainWindow === null) {
    createWindow()
  }
})

// In dieser Datei können Sie den Rest des App-spezifischen 
// Hauptprozess-Codes einbinden. Sie können den Code auch 
// auf mehrere Dateien aufteilen und diese hier einbinden.
