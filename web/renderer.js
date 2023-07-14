window.$ = window.jQuery = require("jquery");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { ipcRenderer } = require("electron");
const crypto = require("crypto");
const { Auth } = require("msmc");
const { dialog } = require("electron");