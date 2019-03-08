const electron = window.require('electron');
const path = window.require('path');
const fs = window.require('fs').promises;

export class Storage {
  opts
  constructor(opts) {
      this.opts = opts
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(userDataPath, opts.configName + '.json');
  }
  
  // This will just return the property on the `data` object
  get(key) {
    return new Promise((resolve, reject) => {
        parseDataFile(this.path, this.opts.defaults).then(file => {
            resolve(file[key]);
        })
        .catch(err => reject(err));
    })
  }
  
  // ...and this will set it
  async set(key, val) {
    return new Promise((resolve, reject) => {
        parseDataFile(this.path, this.opts.defaults).then(async file => {
            file[key] = Object.assign(val, {timestamp: new Date().valueOf()});
            // Wait, I thought using the node.js' synchronous APIs was bad form?
            // We're not writing a server so there's not nearly the same IO demand on the process
            // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
            // we might lose that data. Note that in a real app, we would try/catch this.
            await fs.writeFile(this.path, JSON.stringify(file));
            console.log("saved", file, "to", this.path)
            resolve(true)
        })
        .catch(err => reject(err));
    })
  }
}

function parseDataFile(filePath, defaults) {

    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8').then(file => {
            resolve(JSON.parse(file))
        })
        .catch(err => {
            console.log("Tried to read file",err)
            // if there was some kind of error, return the passed in defaults instead.
            resolve(defaults);
        })
    })
    /*
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
  */
}