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

  // Checks if the result id already existed in the table, otherwise return nothing/undefined
  resultData.forEach(async (person) => {
    const existingPerson = await db.get(
      "SELECT result_id FROM runsignup_data WHERE result_id = ?",
      [person.result_id]
    );

    const { bib, first_name, last_name, clock_time, result_id } = person;

    // If the person we want to store, set by the function above, does not exist in the table, then insert them into the chart
    if (existingPerson === undefined) {
      await db.run(
        "INSERT INTO runsignup_data (result_id, bib, first_name, last_name, time) VALUES(?, ?, ?, ?, ?)",
        [result_id, bib, first_name, last_name, clock_time]
      );
    }
  });

  res.send("hello world");
});

// Starts the server and allows access to the local server via the port
expressApp.listen(port, () => {
  console.log(`Express server is listening on port ${port}`);
});