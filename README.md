# Amazon Review Dashboard

An Electron Application to analyze and manage Amazon Reviews. Based on React. Utilizes Puppeteer to fetch publicly available web data from Amazon.<br><br>

## Aim of the application

It should be possible to analyze written reviews and monitor changes (helpful clicks, comments, deletions).<br>
Unfortunately Amazon doesn't offer this functionality anymore and so we had to create our own solution.<br>
This application is inspired by the solution "ARAT" (Amazon Review Analysis Tool) which was already available a few years ago. <br>Unfortunately, this solution was discontinued after changes by Amazon, because it still relied on the old APIs.<br>
<br>
ARAT:<br>
https://www.youtube.com/watch?v=D77rb-_6Gos<br>


## Needed Software & Initialization

To initialize the project with the available repository clone or download the repository.<br>
Later there will be an easy to use .exe (Windows) or .dmg (Mac)<br><br>

To run it at the current stage you need following software:<br>
* [Node.js / npm](https://nodejs.org/en/)
* A terminal to use npm

With terminal navigate into the downloaded folder and execute

```
npm i
```
That will install all dependencies that are required.<br>
Now run
```
npm start
```
That will start the application locally.  You can start electron now and view the application:

```
npm run electron
```

The page will reload if you make edits to the code.<br>
You will also see any lint errors in the console.

