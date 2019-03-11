const electron = window.require("electron");
const path = window.require("path");
const fs = window.require("fs").promises;
const fsSync = window.require("fs");

export class Storage {
  opts;
  constructor(opts) {
    this.opts = opts;
    // Renderer process has to get `app` module via `remote`, whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    const userDataPath = (electron.app || electron.remote.app).getPath(
      "userData"
    );
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
    this.path = path.join(
      userDataPath,
      "JSONStorage",
      opts.configName + ".json"
    );
  }

  // This will just return the property on the `data` object
  get(key) {
    return new Promise((resolve, reject) => {
      parseDataFile(this.path, this.opts.defaults)
        .then(file => {
          resolve(file[key]);
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
      parseDataFile(this.path, this.opts.defaults)
        .then(async file => {
          file[key] = val;
          // Wait, I thought using the node.js' synchronous APIs was bad form?
          // We're not writing a server so there's not nearly the same IO demand on the process
          // Also if we used an async API and our app was quit before the asynchronous write had a chance to complete,
          // we might lose that data. Note that in a real app, we would try/catch this.

          await fs.writeFile(this.path, JSON.stringify(file));
          console.log("saved", file, "to", this.path);
          resolve(true);
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
