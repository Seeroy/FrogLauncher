var path = require('path');
const { BrowserWindow } = require("electron");

const CW_OPTIONS = {
  width: 1024,
  height: 640,
  minWidth: 830,
  minHeight: 560,
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
const CW_URL = "web/console.html";

exports.create = (cb = function(){}) => {
  consoleWindowObject = new BrowserWindow(CW_OPTIONS);

  consoleWindowObject.loadFile(CW_URL);

  consoleWindowObject.once("ready-to-show", () => {
    consoleWindowObject.show();
    cb();
  });
};