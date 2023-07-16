// Загрузка модулей
const { app, ipcMain, dialog } = require("electron");
require("console-stamp")(console, {
  format: ":date(HH:MM:ss.l)",
});
const os = require("os");

var pjson = require("./package.json");
const APPVER = pjson.version; // Версия из package.json

// Модуль для Discord Rich Presence
const DISCORD_APP_ID = "1129749846241333378";
var rpc = require('discord-rpc');
const client = new rpc.Client({ transport: 'ipc'});
client.login({ clientId: DISCORD_APP_ID }).catch(console.error);

// Создаём глобальные переменные для хранения BrowserWindow
global.mainWindowObject;
global.consoleWindowObject;

// Кастомные модули
var startTimer = require("./modules/starttimer"); // Модуль для получения времени запуска оболочки
var logging = require("./modules/logging"); // Модуль для стилизации логов
var ipcHandlers = require("./modules/ipc"); // Модуль с хэндлерами IPC
var mainWindow = require("./windows/mainWindow"); // Модуль для создания главного окна
var consoleWindow = require("./windows/consoleWindow"); // Модуль для окна консоли

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
  consoleWindow.create();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow.create(function () {
        startTimer.checkStartTimer();
      });
      consoleWindow.create();
    }
  });

  ipcMain.on("log-browser-console", ipcHandlers.handleBrowserLog);
  ipcMain.on("log-browser-console-only", ipcHandlers.handleBrowserLogOnly);

  ipcMain.on("close-console-window", () => {
    consoleWindowObject.hide();
  });
  ipcMain.on("open-console-window", () => {
    if (!consoleWindowObject.isVisible()) {
      consoleWindowObject.show();
    } else {
      consoleWindowObject.focus();
    }
  });
  ipcMain.on("hide-console-window", () => {
    consoleWindowObject.minimize();
  });

  ipcMain.on("close-main-window", () => {
    app.quit();
  });
  ipcMain.on("hide-main-window", () => {
    mainWindowObject.minimize();
  });

  ipcMain.on("focus-fix", () => {
    mainWindowObject.blur();
    mainWindowObject.focus();
  });

  ipcMain.on("restart-launcher", () => {
    app.relaunch();
    app.exit();
  });

  ipcMain.on("open-gd-dialog", (event) => {
    var dialogRet = dialog.showOpenDialogSync({
      properties: ["openDirectory", "dontAddToRecent"],
      buttonLabel: "Выбрать",
      title: "Выберите папку для хранения файлов игры",
    });
    if (dialogRet !== undefined) {
      event.sender.send("get-gd-result", dialogRet[0]);
    } else {
      event.sender.send("get-gd-result", false);
    }
  });

  ipcMain.on("open-bg-dialog", (event) => {
    var dialogBg = dialog.showOpenDialogSync({
      properties: ["openFile", "dontAddToRecent"],
      filters: [
        { name: "Изображение .png", extensions: ["png"] },
        { name: "Изображение .jpg (.jpeg)", extensions: ["jpg", "jpeg"] },
        { name: "Изображение .gif", extensions: ["gif"] },
      ],
      buttonLabel: "Выбрать",
      title: "Выберите изображение для фона в лаунчере",
    });
    if (dialogBg !== undefined) {
      event.sender.send("get-bg-result", dialogBg[0]);
    } else {
      event.sender.send("get-bg-result", false);
    }
  });

  ipcMain.on("set-discord-rpc", (event, data) => {
    client.request('SET_ACTIVITY', {
      pid: process.pid,
      activity: data
    });
  });

  ipcMain.on("stop-discord-rpc", (event, data) => {
    client.destroy();
  });
});
