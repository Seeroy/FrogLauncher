var logging = require("./logging");

exports.handleBrowserLog = (event, text) => {
  var category = text.match(/\[.{0,}\]/gm);
  var rawText = text;
  if (category != null && category.length > 0) {
    rawText = rawText.replace(category + " ", "").trim();
    category = category[0].replace(/\[/, "").replace(/\]/, "");
    logging.browserLog(category, rawText);
  } else {
    logging.browserLog("", rawText);
  }
};
