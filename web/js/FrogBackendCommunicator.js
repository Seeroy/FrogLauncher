class FrogBackendCommunicator {
  static logBrowserConsole(...args) {
    console.log(args.join(" "));
    ipcRenderer.send("log-browser-console", args.join(" "));
  }

  static logBrowserConsoleOnly(...args) {
    ipcRenderer.send("log-browser-console-only", args.join(" "));
  }

  static openGameDirectoryDialog() {
    ipcRenderer.send("open-gd-dialog");
  }
  
  static openBackgroundSelectDialog() {
    ipcRenderer.send("open-bg-dialog");
  }

  static restartLauncher() {
    ipcRenderer.send("restart-launcher");
  }

  static onHideMainWindow = () => {
    ipcRenderer.send("hide-main-window");
    FrogBackendCommunicator.logBrowserConsole(
      "Executed `onHideMainWindow` on",
      Date.now()
    );
  };

  static onCloseMainWindow = () => {
    ipcRenderer.send("close-main-window");
    FrogBackendCommunicator.logBrowserConsole(
      "Executed `onCloseMainWindow` on",
      Date.now()
    );
    FrogBackendCommunicator.logBrowserConsole("Bye bye!");
  };

  static onHideConsoleWindow = () => {
    ipcRenderer.send("hide-console-window");
    FrogBackendCommunicator.logBrowserConsole(
      "Executed `onHideConsoleWindow` on",
      Date.now()
    );
  };

  static onOpenConsoleWindow = () => {
    ipcRenderer.send("open-console-window");
    FrogBackendCommunicator.logBrowserConsole(
      "Executed `onOpenConsoleWindow` on",
      Date.now()
    );
  };

  static onCloseConsoleWindow = () => {
    ipcRenderer.send("close-console-window");
    FrogBackendCommunicator.logBrowserConsole(
      "Executed `onCloseConsoleWindow` on",
      Date.now()
    );
  };
}
