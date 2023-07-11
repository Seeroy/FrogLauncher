// Загрузка модулей
const { app, ipcMain } = require("electron");
require("console-stamp")(console, {
  format: ":date(HH:MM:ss.l)",
});
const os = require("os");

var pjson = require("./package.json");
const APPVER = pjson.version; // Версия из package.json

global.mainWindowObject;

// Кастомные модули
var startTimer = require("./modules/starttimer"); // Модуль для получения времени запуска оболочки
var logging = require("./modules/logging"); // Модуль для стилизации логов
var ipcHandlers = require("./modules/ipc"); // Модуль с хэндлерами IPC
var mainWindow = require("./windows/mainWindow"); // Модуль для создания главного окна

logging.default("Debug", "Starting FrogLauncher at " + Date.now());

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

app.whenReady().then(() => {
  mainWindow.create(function () {
    startTimer.checkStartTimer();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow.create(function () {
        startTimer.checkStartTimer();
      });
    }
  });

  ipcMain.on("log-browser-console", ipcHandlers.handleBrowserLog);
  ipcMain.on("close-main-window", app.quit);
  ipcMain.on("hide-main-window", mainWindowObject.minimize);
  ipcMain.on("focus-fix", () => {
    mainWindowObject.blur();
    mainWindowObject.focus();
  });
});
