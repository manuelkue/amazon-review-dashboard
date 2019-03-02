const { app, BrowserWindow } = require('electron')
const puppeteer = require('puppeteer');
let win

function createWindow () {
  win = new BrowserWindow({ width: 800, height: 600 })
  win.loadFile('build/index.html')
  win.webContents.openDevTools()

  crawlReviewIDs('https://amzn.to/2LNaqPo')

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

async function crawlReviewIDs(userProfileURL){
  const startTime = new Date().getTime()
  let endTime;
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.setViewport({ width: 1920, height: 1080 });

  if(true){
    await page.setRequestInterception(true);
  
    page.on('request', (req) => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
            req.abort();
        }
        else {
            req.continue();
        }
    });
  }

  await page.goto(userProfileURL)
  const name = await page.$eval('span.nav-line-2', el => el.innerText)

  endTime = new Date().getTime()
  
  console.log("endTime ", endTime, "startTime ", startTime)
  console.log("name ", name, "\nResponse after ", +endTime - startTime, "ms")
  
  await page.waitFor(30000);
  await page.close();
  await browser.close()
}