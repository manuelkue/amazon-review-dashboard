const electron = window.require("electron");
const path = window.require("path");
const fsSync = window.require("fs");

const storageDir = "JSONStorage";

export class Storage {
  opts;
  constructor(opts) {
    this.opts = opts;
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath(
      "userData"
    );
    // Create storage dir if not exists
    if(!fsSync.existsSync(path.join(userDataPath, storageDir))){
        fsSync.mkdirSync(path.join(userDataPath, storageDir))
        console.log("StorageDir created")
    }
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(
      userDataPath,
      storageDir,
      opts.configName + ".json"
    );
  }

  // This will just return the property on the `data` object
  get(key) {
    return new Promise((resolve, reject) => {
      if(typeof key === "string"){
        parseDataFile(this.path, this.opts.defaults)
          .then(file => {
            resolve(file[key]);
          })
          .catch(err => {
            console.error(err);
            reject(err);
          })
      }else{
        reject('No single key string provided')
      }
    });
  }

  // This will return multiple properties on the `data` object to an object containing the properties of the given array
  getMulti(keys) {
    return new Promise((resolve, reject) => {
      parseDataFile(this.path, this.opts.defaults)
        .then(file => {
          if(Array.isArray(keys)){
            let resultsObj = {}
            keys.forEach(key => resultsObj[key] = (file[key]))
            resolve(resultsObj);
          }else{
            reject('No key array provided')
          }
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }

  // ...and this will set it
  async set(key, val) {
    return new Promise((resolve, reject) => {         
       //@TODO: If new write action should start before the current one is not finished add to line that is processed after the current write action is finished -> File won't be destroyed if current writing process gets interrupted
      parseDataFile(this.path, this.opts.defaults)
        .then(file => {
          file[key] = val;
          // Wait, I thought using the node.js' synchronous APIs was bad form?
          // We're not writing a server so there's not nearly the same IO demand on the process
          // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
          // we might lose that data. Tested with async -> Doesn't work often: 
          // https://stackoverflow.com/questions/30886217/node-js-fs-writefile-empties-the-file

          //@TODO: Eventuell einbauen, dass er die alte Datei sichert und bei einem Schreibfehler diese alte Datei wieder darüber schreibt, um keine Daten zu verlieren

          console.log("try to save", file, "to", this.path);
          try{
            fsSync.writeFileSync(this.path, JSON.stringify(file), 'utf8')
            console.log("saved", file, "to", this.path);
            resolve(true);
          }
          catch(err){
            console.error(err);
            reject(err)
          }
        })
        .catch(err => reject(err));
    });
  }
}

function parseDataFile(filePath, defaults) {
  return new Promise((resolve, reject) => {
    let file;
    try {
      file = fsSync.readFileSync(filePath, { encoding: "utf8" });
      console.log("Read file", filePath);
      resolve(JSON.parse(file));
    } catch (err) {
      console.log("File not available", filePath);
      resolve(defaults);
    }
  });
  /*
    Using the sync variant of readfile because async doesn't work in this case strangely enough
    Like this:
    https://github.com/nodejs/node-v0.x-archive/issues/15515
  */
}

export const reviewStorage = new Storage({
  configName: "fetchedReviews",
  defaults: {
    reviews: []
  }
});

export const userStorage = new Storage({
  configName: "fetchedUsers",
  defaults: {
    users: []
  }
});

export const configStorage = new Storage({
  configName: "appConfig",
  defaults: {
    fetchURL: ""
  }
});

export const logStorage = new Storage({
  configName: "logs",
  defaults: {
    crawls: []
  }
});
