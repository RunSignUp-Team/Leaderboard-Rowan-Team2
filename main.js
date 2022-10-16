// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const express = require("express");

// Setting up express server
const expressApp = express();
expressApp.use(express.json());
const port = 3000;

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Endpoint that receives data from renderer.js and uploads it to sqlite table
expressApp.post("/upload-data", async (req, res) => {
  const resultData = req.body;

  const db = await open({
    filename: "./RunSignUp.db",
    driver: sqlite3.Database,
  });

  const existingPerson = await db.get(
    "SELECT result_id FROM runsignup_data WHERE result_id = ?",
    ["12345"]
  );

  
  /*
   *  Code to be worked on
   *
  if (existingPerson === undefined)  {

  }

  resultData.forEach((person) => {

  })

  */

  res.send("Hello World");
});

expressApp.listen(port, () => {
  console.log(`Express server is listening on port ${port}`);
});