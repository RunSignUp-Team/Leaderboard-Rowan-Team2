import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once("ipc-example", (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});

console.log('i run outside')
window.electron.ipcRenderer.on("create-window", (path) => {
  console.log('i run')
  console.log("redirect to path", path);
});
window.electron.ipcRenderer.sendMessage("ipc-example", ["ping"]);
