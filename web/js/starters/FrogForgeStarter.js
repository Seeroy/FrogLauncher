class FrogForgeStarter {
  constructor(opts, url) {
    this.options = opts;
    this.downloadURL = url;
  }

  prepareForLaunch(cb) {
    var forgeFilename = FrogUtils.getFilenameFromURL(this.downloadURL);
    var forgePath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      forgeFilename
    );
    if (!fs.existsSync(forgePath)) {
      FrogDownloadManager.downloadByURL(
        this.downloadURL,
        forgePath,
        (dlRes) => {
          if (dlRes == true) {
            cb(true);
          } else {
            Toaster(
              "Ошибка при скачивании Forge<br>DLRES_IS_FALSE",
              4000,
              false,
              "error"
            );
            cb(false);
          }
        }
      );
    } else {
      cb(true);
    }
  }

  launch() {
    FrogStartManager.parseStartStatus('mclc-start-evt');
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start Forge Minecraft",
      this.options.version.number
    );
    launcher.launch(this.options);
    launcher.on("debug", (e) => {
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
    });
    launcher.on("close", (e) => {
      FrogStartManager.parseStartStatus("mclc-close-evt");
      if (e > 0 && e != 127 && e != 255) {
        FrogBackendCommunicator.logBrowserConsoleOnly(
          "<span class='text-red-500'>Game closed with exit code " +
            e +
            "</span>"
        );
        Toaster(
          "Minecraft завершился с кодом ошибки <span class='mc-text text-red-600 text-lg ml-2'>" +
            e +
            "</span><br>Подробная информация в консоли",
          4500,
          false,
          "error"
        );
      } else {
        FrogBackendCommunicator.logBrowserConsoleOnly(
          "<span class='text-green-500'>Game closed with exit code " +
            e +
            "</span>"
        );
      }
    });
    launcher.on("data", (e) => {
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
      FrogStartManager.parseStartStatus(e);
    });
    launcher.on("download-status", function (e) {
      FrogDownloadManager.handleDownloadStatus(e);
    });
    launcher.on("progress", function (e) {
      FrogDownloadManager.handleProgressStatus(e);
    });
  }
}
