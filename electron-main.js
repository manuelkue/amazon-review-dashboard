const { app, BrowserWindow, ipcMain } = require('electron')
const Storage = require('./src/node-logic/storage');
const puppeteer = require('puppeteer');
let mainWindow

const maxScrapingTime = 300000;
let scraping;

const storage = new Storage({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1800, height: 1000 }
  }
});

////////////////////////
// Puppeteer
////////////////////////

ipcMain.on('startCrawl', (event, startCrawl) => {
  console.log("\n\ncrawling from", startCrawl.url, "\n")
  crawlReviews(startCrawl.url, startCrawl.maxReviewNumber, startCrawl.onlyProfile)
})


async function crawlReviews(userProfileURL, maxReviewNumber, onlyProfile){
  const scrapeStartTime = new Date().getTime()
  scraping = true;
  let reviews = [];

  const browser = await puppeteer.launch({ headless: true })
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
        helpfulVotes = +json.helpfulVotes.helpfulVotesData.count.split(".").join('')
        reviewsCount = +json.reviews.reviewsCountData.count.split(".").join('')
        if(name && rank) mainWindow.webContents.send('profileScraped', {name, rank, helpfulVotes, reviewsCount})
      })
      .catch(err => {
        console.log('gamificationError')
        interruptedByAmazon(err, page, browser)
      })
    }

    //reading xhr-json-responses (reviews)
    if(!onlyProfile && response.url().includes('profilewidget')){
      response.json()
      .then(async responseObj => {
        reviews.push(...responseObj['contributions']);
        console.log("reviewsCount", reviews.length);
        mainWindow.webContents.send('reviewsScrapedSoFar', reviews.length)
        if(!responseObj.nextPageToken || reviews.length >= maxReviewNumber){
          console.log("\n#############\nScrapeComplete");
          console.log("Total time of scraping", new Date().getTime() - scrapeStartTime, "ms")
          console.log("reviewsCount", reviews.length);
          scraping = false;
          mainWindow.webContents.send('reviewsScraped', reviews)
          mainWindow.webContents.send('scrapeComplete', new Date().getTime() - scrapeStartTime)
          await closeConnection (page, browser)
        }
      })
      .catch(err => {
        mainWindow.webContents.send('reviewsScrapedInterrupted', reviews)
        console.log('profilewidgetError')
        interruptedByAmazon(err, page, browser)
      })
      page.evaluate(() => {
        window.scrollTo(0,document.body.scrollHeight)
      });
    }
  })

  await page.goto(userProfileURL)
  .then(async () => {
    name = await page.$eval('.name-container span', el => el.innerText)
      .catch(() => console.error('$eval name not successfull'))
    rank = await page.$eval('.a-spacing-base a.a-link-normal', el => +el.getAttribute('href').split('rank=')[1].split('#')[0])
      .catch(() => console.error('$eval rank not successfull, userrank too high -> no link available'))
    rank = rank || 0;
    if(helpfulVotes && reviewsCount) mainWindow.webContents.send('profileScraped', {name, rank, helpfulVotes, reviewsCount})
  
  // If no completeCrawl scraping has to be deactivated here
  if (onlyProfile){
    scraping = false
    mainWindow.webContents.send('scrapeComplete',  new Date().getTime() - scrapeStartTime)
    await closeConnection (page, browser)
  }
  console.log("First full load after", new Date().getTime() - scrapeStartTime, "ms")
  })
  .catch(async err => {
    mainWindow.webContents.send('scrapeError', 'Connection failed.')
    console.info('Connection failed');
    await closeConnection(page, browser)
  })
}

async function interruptedByAmazon(err, page, browser){
  mainWindow.webContents.send('scrapeError', 'Interrupted by Amazon, too many attempts')
  scraping = false;
  await closeConnection (page, browser)
  console.error(err)
}

async function closeConnection (page, browser){
      try{
        await page.close();
        await browser.close();
        console.log("connection closed")
      }
      catch{
        console.log("connection already closed")
      }
}

////////////////////////
// Electron
////////////////////////

// Diese Methode wird aufgerufen, wenn Electron mit der
// Initialisierung fertig ist und Browserfenster erschaffen kann.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.on('ready', ()=>{
  let { width, height } = storage.get('windowBounds');
  mainWindow = new BrowserWindow({ width, height })

  // mainWindow.on('resize', () => {
  //   let { width, height } = mainWindow.getBounds();
  //   storage.set('windowBounds', { width, height });
  // });
  
  mainWindow.on('closed', () => {
    // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
    // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt. 
    // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
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
