// Загрузка модулей
const { app, ipcMain, BrowserWindow } = require("electron");
require("console-stamp")(console, {
  format: ":date(HH:MM:ss.l)",
});
const os = require("os");
const colors = require("colors");
const path = require("path");

var pjson = require("./package.json");
var win;
const APPVER = pjson.version; // Версия из package.json

// Кастомные модули
var startTimer = require("./modules/starttimer"); // Модуль для получения времени запуска оболочки
var logging = require("./modules/logging"); // Модуль для стилизации логов

logging.inverse(
  "FrogLauncher " +
    APPVER +
    " on " +
    os.hostname() +
    " | " +
    os.cpus()[0].model +
    " | " +
    Math.round(os.totalmem() / (1024 * 1024 * 1024)) +
    " Gb RAM"
);
logging.inverse("Developed by Seeroy");
logging.default("Debug", "node version: " + process.versions["node"]);
logging.default("Debug", "chrome version: " + process.versions["chrome"]);
logging.default("Debug", "electron version: " + process.versions["electron"]);

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 640,
    minWidth: 1024,
    minHeight: 640,
    hasShadow: true,
    show: false,
    icon: "resources/icon.ico",
    resizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, "web/preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("web/index.html");

  win.once("ready-to-show", () => {
    win.show();
    if (startTimer.ifStartCompleted() == false) {
      time = startTimer.startCompleted();
      logging.default("Debug", "Started. Time: " + time + " sec")
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});