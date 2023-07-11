var logging = require('./logging');

var startTime_temp = process.hrtime()
exports.startTime = Math.round(startTime_temp[0] * 1000 + startTime_temp[1] / 1000000); // timestamp сразу после загрузки модуля (для отсчёта)
exports.startLogged = false;

exports.startCompleted = () => {
  if(exports.startLogged == false){
    curTime = process.hrtime()
    curTime = Math.round(curTime[0] * 1000 + curTime[1] / 1000000); // timestamp в данный момент
    this.startLogged = true;
    return Math.round(curTime - this.startTime) / 1000; // Старт завершён, результат в сек с округлением до тысячных
  }
}; 

exports.ifStartCompleted = () => {
  return this.startLogged;
}

exports.checkStartTimer = () => {
  if (!this.startLogged) {
    time = this.startCompleted();
    logging.default("Debug", "Started. Time: " + time + " sec")
  }
};