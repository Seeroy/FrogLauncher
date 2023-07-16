class FrogFabricStarter {
  constructor(opts, dlurl) {
    this.options = opts;
    this.fabricApiDownloadURL = dlurl;
  }

  prepareForLaunchStep1(cb) {
    if(this.fabricApiDownloadURL == false){
      cb();
      return;
    }
    var fabricApiFilename = FrogUtils.getFilenameFromURL(this.fabricApiDownloadURL);
    var fabricApiPath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      fabricApiFilename
    );
    var fabricApiPathDest = path.join(
      mainConfig.selectedBaseDirectory,
      "mods",
      fabricApiFilename
    );
    FrogStartManager.deleteTemporaryMods();
    if (!fs.existsSync(fabricApiPath)) {
      FrogDownloadManager.downloadByURL(this.fabricApiDownloadURL, fabricApiPath, (dlRes) => {
        if (dlRes == true) {
          fs.copyFileSync(fabricApiPath, fabricApiPathDest);
          cb(true);
        } else {
          Toaster(
            "Ошибка при скачивании FabricAPI<br>DLRES_IS_FALSE",
            4000,
            false,
            "error"
          );
          cb(false);
        }
      });
    } else {
      fs.copyFileSync(fabricApiPath, fabricApiPathDest);
      cb(true);
    }
  }

  launch() {
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start Fabric",
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