const colors = require("colors");
const fs = require("fs");

exports.default = function (category = "", text) {
  // Log level default, используется везде
  if (category == "") {
    console.log(text);
  } else {
    console.log(colors.brightBlue("[" + category + "]"), text);
  }
  this.writeLogFile(category, text, false);
};

exports.inverse = function (text) {
  // console.log с обратным цветом
  console.log(colors.inverse(text));
  this.writeLogFile("INVERSE", text, false);
};

exports.error = function (category = "", text) {
  // Log level error
  if (category == "") {
    console.log(text);
  } else {
    console.log(colors.brightBlue("[" + category + "]"), colors.red(text));
  }
  this.writeLogFile(category, text, true);
};

exports.writeLogFile = (category, text, isError = false) => {
  if (!fs.existsSync("./logs")) {
    fs.mkdirSync("./logs");
  }
  var resText = "";
  var todayDate = new Date();
  todayDate = todayDate.getDate() + "-" + todayDate.getMonth() + "-" + todayDate.getFullYear();
  if (isError == true) {
    resText = "[" + category + "] (ERROR)" + " " + text + "\n";
  } else {
    resText = "[" + category + "]" + " " + text + "\n";
  }
  fs.appendFileSync("./logs/" + todayDate + ".log", resText);
};
