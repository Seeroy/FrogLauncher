class FrogBackendCommunicator{
  static logBrowserConsole(...args){
    console.log(args.join(" "));
    ipcRenderer.send("log-browser-console", args.join(" "));
  }

  static onHideMainWindow = () => {
    ipcRenderer.send("hide-main-window");
    FrogBackendCommunicator.logBrowserConsole("Executed `onHideMainWindow` on", Date.now());
  }

  static onCloseMainWindow = () => {
    ipcRenderer.send("close-main-window");
    FrogBackendCommunicator.logBrowserConsole("Executed `onCloseMainWindow` on", Date.now());
    FrogBackendCommunicator.logBrowserConsole("Bye bye!");
  }
}