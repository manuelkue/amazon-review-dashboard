const { app, BrowserWindow } = require('electron')
const puppeteer = require('puppeteer');
let win

////////////////////////
// Puppeteer
////////////////////////

crawlReviewIDs('https://www.amazon.de/gp/profile/amzn1.account.AH66ZZWKVCLVHB7XDYDHHE3GYK2A')

async function crawlReviewIDs(userProfileURL){
  const scrapeStartTime = new Date().getTime()
  let reviews = [];

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
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
    if(response.url().includes('profilewidget')){
      response.text()
      .then(json => {
        let reviewCluster = JSON.parse(json);
        reviews.push(...reviewCluster['contributions']);
        console.log("reviewsCount", reviews.length);
        if(!reviewCluster.nextPageToken){
          console.log("\n#############\nReached End of Page");
          console.log("Total time of scraping", new Date().getTime() - scrapeStartTime, "ms")
          console.log("reviewsCount", reviews.length);
        }
        page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });

      })
      .catch(err => console.error(err))
    }
  })

  await page.goto(userProfileURL)

  try{
    const helpfulVotes = await page.$eval('.dashboard-desktop-stat-value', el => el.innerText)
    console.log("Helpful Votes", helpfulVotes)
  }
  catch(err){
    console.error(err)
  }

  console.log("First full load after", new Date().getTime() - scrapeStartTime, "ms")

  await page.close();
  await browser.close()
}

////////////////////////
// Electron
////////////////////////


function createWindow () {
  win = new BrowserWindow({ width: 800, height: 600 })
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
