const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { open } = require('sqlite')
const sqlite3 = require('sqlite3')

let mainWindow;

let tableWindows = [];

// Creates the main window 
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile("./build/index.html");
  }


  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTableWindow(data) {
  let tableWindow =
    new BrowserWindow({
      width: 1080,
      height: 720,
      webPreferences: {
        nodeIntegration: true,
        preload: path.join(__dirname, "preload.js"),
      },
    })

  tableWindows.push(tableWindow);
  tableWindow.webContents.on('did-finish-load', () => {
    tableWindow.webContents.send('get-data', data)
  })

  if (process.env.NODE_ENV === "development") {
    tableWindow.loadURL("http://localhost:3000");
    tableWindow.webContents.openDevTools();
  } else {
    tableWindow.loadFile("public/index.html");
  }


  tableWindow.on("closed", () => {
    tableWindow = null;
  });

  return tableWindow;
}

ipcMain.on("ipc-example", async (event, arg) => {
  const msgTemplate = (pingPong) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply("ipc-example", msgTemplate("pong"));
});

ipcMain.on('save-data', async (event, resultData) => {
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
})

ipcMain.on("create-window", async (event, data) => {
  const tableWindow = createTableWindow(data);
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
