var path = require('path');
const { BrowserWindow } = require("electron");

const MW_OPTIONS = {
  width: 1024,
  height: 640,
  minWidth: 960,
  minHeight: 540,
  maxWidth: 1600,
  maxHeight: 900,
  hasShadow: true,
  show: false,
  icon: "resources/icon.ico",
  resizable: true,
  maximizable: true,
  autoHideMenuBar: true,
  frame: false,
  transparent: true,
  webPreferences: {
    preload: path.join(__dirname, "../web/preload.js"),
    nodeIntegration: true,
    contextIsolation: false,
  },
};
const MW_URL = "web/index.html";

exports.create = (cb) => {
  mainWindowObject = new BrowserWindow(MW_OPTIONS);

  mainWindowObject.loadFile(MW_URL);

  mainWindowObject.once("ready-to-show", () => {
    mainWindowObject.show();
    cb();
  });
};