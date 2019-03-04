const { app, BrowserWindow, ipcMain } = require('electron')
const Storage = require('./src/node-logic/storage');
const puppeteer = require('puppeteer');
let mainWindow

const maxScrapingTime = 300000;
let scraping;

const storage = new Storage({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 }
  }
});

////////////////////////
// Puppeteer
////////////////////////

ipcMain.on('startCrawl', (event, arg) => {
  console.log(arg, "\n")
  crawlReviews('https://www.amazon.de/gp/profile/amzn1.account.AG73C2QECBL4OTKMUZYNMGMAI5OA', true)
})


async function crawlReviews(userProfileURL, completeCrawl){
  const scrapeStartTime = new Date().getTime()
  scraping = true;
  let reviews = [];

  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  setTimeout(async () => {
    await closeConnection (page, browser)
    scraping && mainWindow.webContents.send('scrapeError', 'Scraping interrupted, Scraping took too long')
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
  
  page.on('response', response => {
    if(completeCrawl && response.url().includes('profilewidget')){
      response.json()
      .then(async json => {
        const reviewCluster = json;
        reviews.push(...reviewCluster['contributions']);
        console.log("reviewsCount", reviews.length);
        mainWindow.webContents.send('reviewsScrapedSoFar', reviews.length)
        if(!reviewCluster.nextPageToken){
          console.log("\n#############\nScrapeComplete");
          console.log("Total time of scraping", new Date().getTime() - scrapeStartTime, "ms")
          console.log("reviewsCount", reviews.length);
          scraping = false;
          mainWindow.webContents.send('reviewsScraped', reviews)
          mainWindow.webContents.send('scrapeComplete', new Date().getTime() - scrapeStartTime)
          await closeConnection (page, browser)
        }else{
          page.evaluate(() => {
            window.scrollBy(0, window.innerHeight)
          });
        
        }

      })
      .catch(err => {
        mainWindow.webContents.send('reviewsScrapedInterrupted', reviews)
        interruptedByAmazon(err, page, browser)
      })
    }
    if(response.url().includes('gamification')){
      response.json()
      .then(json => {
          mainWindow.webContents.send('profileReviewsHelpfulCounts', json)
      })
      .catch(err => {
        interruptedByAmazon(err, page, browser)
      })
    }
  })

  let name 
  let rank 
    await page.goto(userProfileURL).catch(async err => {
      mainWindow.webContents.send('scrapeError', 'Connection failed')
      console.info('Connection failed');
      await closeConnection(page, browser)
    })
    name = await page.$eval('.name-container span', el => el.innerText)
      .catch(() => console.error('$eval name not successfull'))
    rank = await page.$eval('.a-spacing-base a.a-link-normal', el => +el.getAttribute('href').split('rank=')[1].split('#')[0])
      .catch(() => console.error('$eval rank not successfull'))
    mainWindow.webContents.send('profileNameRank', {name, rank})
 
  // If no completeCrawl scraping has to be deactivated here
  if (!completeCrawl){
    scraping = false
    mainWindow.webContents.send('scrapeComplete',  new Date().getTime() - scrapeStartTime)
  }
  console.log("First full load after", new Date().getTime() - scrapeStartTime, "ms")
}

async function interruptedByAmazon(err, page, browser){
  mainWindow.webContents.send('scrapeError', 'Interrupted by Amazon, too many attempts')
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

  mainWindow.loadFile('build/index.html')
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
