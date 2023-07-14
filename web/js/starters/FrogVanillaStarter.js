class FrogVanillaStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogUI.changeBottomControlsStatus(false, true, true);
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start Vanilla Minecraft",
      this.options.version.number
    );
    launcher.launch(this.options);
    launcher.on("debug", (e) => FrogBackendCommunicator.logBrowserConsole(e));
    launcher.on("data", (e) => FrogBackendCommunicator.logBrowserConsole(e));    
    launcher.on('download-status', function (e) {
      FrogDownloadManager.handleDownloadStatus(e);
    });
    launcher.on('progress', function (e) {
      FrogDownloadManager.handleProgressStatus(e);
    });
  }
}