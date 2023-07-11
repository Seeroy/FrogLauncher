class FrogBackendCommunicator{
  static logBrowserConsole(...args){
    console.log(args.join(" "));
    ipcRenderer.send("log-browser-console", args.join(" "));
  }
}