const { app, BrowserWindow, ipcMain } = require('electron')
const puppeteer = require('puppeteer');
let win

const maxScrapingTime = 300000;
let scraping;

////////////////////////
// Puppeteer
////////////////////////

ipcMain.on('startCrawl', (event, arg) => {
  console.log(arg, "\n")
  crawlReviews('https://www.amazon.de/gp/profile/amzn1.account.AG4PLE2SL7LDA33T24LPR3BF2K4A', true)
})


async function crawlReviews(userProfileURL, completeCrawl){
  const scrapeStartTime = new Date().getTime()
  scraping = true;
  let profile = {};
  let reviews = [];

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  setTimeout(async () => {
    await closeConnection (page, browser)
    scraping && win.webContents.send('scrapeError', 'Scraping interrupted, Scraping took too long')
  }, maxScrapingTime)

  await page.setViewport({ width: 500, height: 10000 });

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
  
  let getProfileJSON

    page.on('response', response => {
      if(completeCrawl && response.url().includes('profilewidget')){
        response.json()
        .then(async json => {
          const reviewCluster = json;
          reviews.push(...reviewCluster['contributions']);
          console.log("reviewsCount", reviews.length);
          win.webContents.send('reviewsScrapedSoFar', reviews.length)
          if(!reviewCluster.nextPageToken){
            console.log("\n#############\nScrapeComplete");
            console.log("Total time of scraping", new Date().getTime() - scrapeStartTime, "ms")
            console.log("reviewsCount", reviews.length);
            scraping = false;
            win.webContents.send('reviewsScraped', reviews)
            win.webContents.send('scrapeComplete', new Date().getTime() - scrapeStartTime)
            await closeConnection (page, browser)
          }else{
            page.evaluate(() => {
              window.scrollBy(0, window.innerHeight)
            });
          
          }
  
        })
        .catch(err => {
          blockedByAmazon(err, page, browser)
        })
      }
      if(response.url().includes('gamification')){
        response.json()
        .then(json => {
          getProfileJSON = new Promise((resolve, reject) => {
            profile = Object.assign(profile, json)
            resolve(profile)
          })
        })
        .catch(err => {
          blockedByAmazon(err, page, browser)
        })
      }
    })

  let name 
  let rank 

  await page.goto(userProfileURL)
  const getProfileHTML = new Promise(async (resolve, reject) => {
    name = await page.$eval('.name-container span', el => el.innerText)
    rank = await page.$eval('.a-spacing-base a.a-link-normal', el => +el.getAttribute('href').split('rank=')[1].split('#')[0])
    profile = Object.assign(profile, {name, rank})
    resolve(profile)
  })

  Promise.all([getProfileJSON, getProfileHTML]).then(values => {
    console.log(values);
    win.webContents.send('profileScraped', profile)
  })
 
  // If no completeCrawl scraping has to be deactivated here
  if (!completeCrawl){
    scraping = false
    win.webContents.send('scrapeComplete',  new Date().getTime() - scrapeStartTime)
  }
  console.log("First full load after", new Date().getTime() - scrapeStartTime, "ms")
}

async function blockedByAmazon(err, page, browser){
  win.webContents.send('scrapeError', 'Blocked by Amazon, too many attempts')
  scraping = false;
  await closeConnection (page, browser)
  console.error(err)
}

async function closeConnection (page, browser){
    setTimeout(async () => {
      try{
        await page.close();
        await browser.close();
      }
      catch{
        console.log("connection already closed")
      }
    }, 20000)
}

////////////////////////
// Electron
////////////////////////


function createWindow () {
  win = new BrowserWindow({ width: 1600, height: 1000 })
  win.loadFile('build/index.html')
  win.webContents.openDevTools()

  win.on('closed', () => {
    // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
    // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt. 
    // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
    win = null
  })
}

// Diese Methode wird aufgerufen, wenn Electron mit der
// Initialisierung fertig ist und Browserfenster erschaffen kann.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.on('ready', createWindow)

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
  if (win === null) {
    createWindow()
  }
})

// In dieser Datei können Sie den Rest des App-spezifischen 
// Hauptprozess-Codes einbinden. Sie können den Code auch 
// auf mehrere Dateien aufteilen und diese hier einbinden.
