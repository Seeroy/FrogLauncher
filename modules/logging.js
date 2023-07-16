const colors = require("colors");
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

exports.default = function (category = "", text) {
  // Log level default, используется везде
  if (category == "") {
    console.log(this.getLogTimestamp(), text);
  } else {
    console.log(
      this.getLogTimestamp(),
      colors.brightBlue("[" + category + "]"),
      text
    );
  }
  this.writeLogFile(category, text, false);
};

exports.inverse = function (text) {
  // console.log с обратным цветом
  console.log(this.getLogTimestamp(), colors.inverse(text));
  if (typeof consoleWindowObject !== "undefined") {
    consoleWindowObject.webContents.send("user-console-log", text);
  }
  fs.appendFileSync(
    this.getLogFilePath(),
    this.getLogTimestamp() + " " + text + "\n"
  );
};

exports.error = function (category = "", text) {
  // Log level error
  if (category == "") {
    console.log(this.getLogTimestamp(), text);
    if (
      typeof consoleWindowObject !== "undefined" &&
      consoleWindowObject != null
    ) {
      consoleWindowObject.webContents.send("user-console-log", text);
    }
  } else {
    console.log(
      this.getLogTimestamp(),
      colors.brightBlue("[" + category + "]"),
      colors.red(text)
    );
    if (
      typeof consoleWindowObject !== "undefined" &&
      consoleWindowObject != null
    ) {
      consoleWindowObject.webContents.send(
        "user-console-log",
        category + " " + text
      );
    }
  }
  this.writeLogFile(category, text, true);
};

exports.writeLogFile = (category, text, isError = false) => {
  if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
  }
  var resText = "";

  if (isError == true) {
    resText = "[" + category + "] (ERROR)" + " " + text + "\n";
  } else {
    resText = "[" + category + "]" + " " + text + "\n";
  }
  resText = this.getLogTimestamp() + " " + resText;
  if (
    typeof consoleWindowObject !== "undefined" &&
    consoleWindowObject != null
  ) {
    consoleWindowObject.webContents.send("user-console-log", resText);
  }
  fs.appendFileSync(this.getLogFilePath(), resText);
};

exports.getTodayDate = () => {
  var todayDate = new Date();
  todayDate =
    this.padZero(todayDate.getDate()) +
    "-" +
    this.padZero(todayDate.getMonth() + 1) +
    "-" +
    todayDate.getFullYear();
  return todayDate;
};

exports.browserLog = (category = "", text) => {
  var cwtext = "";
  if (category == "") {
    console.log(colors.green("[BROWSER]"), text);
    cwtext = this.getLogTimestamp() + " [BROWSER] " + text;
    fs.appendFileSync(
      this.getLogFilePath(),
      this.getLogTimestamp() + " [BROWSER] " + text + "\n"
    );
  } else {
    console.log(
      this.getLogTimestamp(),
      colors.green("[BROWSER]"),
      colors.brightBlue("[" + category + "]"),
      text
    );
    cwtext = this.getLogTimestamp() + " [BROWSER] [" + category + "] " + text;
    fs.appendFileSync(
      this.getLogFilePath(),
      this.getLogTimestamp() + " [BROWSER] [" + category + "] " + text + "\n"
    );
  }
  if (
    typeof consoleWindowObject !== "undefined" &&
    consoleWindowObject != null
  ) {
    consoleWindowObject.webContents.send("user-console-log", cwtext);
  }
};

exports.getLogTimestamp = () => {
  var logTimestampDate = new Date();
  logTimestampDate =
    this.padZero(logTimestampDate.getHours()) +
    ":" +
    this.padZero(logTimestampDate.getMinutes()) +
    ":" +
    this.padZero(logTimestampDate.getSeconds()) +
    "." +
    this.padZero(logTimestampDate.getMilliseconds());
  return "[" + logTimestampDate + "]";
};

exports.padZero = (n) => {
  return n < 10 ? "0" + n : n;
};

exports.getLogFilePath = () => {
  return path.join(app.getPath("userData"), "logs", this.getTodayDate() + ".log");
};