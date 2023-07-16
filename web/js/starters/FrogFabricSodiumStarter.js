class FrogFabricSodiumStarter {
  constructor(opts, dlurl1, dlurl2, dlurl3) {
    this.options = opts;
    this.fabricApiDownloadURL = dlurl1;
    this.sodiumDownloadURL = dlurl2;
    this.irisDownloadURL = dlurl3;
  }

  // Function for download FabricAPI
  prepareForLaunchStep1(cb) {
    if (this.fabricApiDownloadURL == false) {
      cb();
      return;
    }
    var fabricApiFilename = FrogUtils.getFilenameFromURL(
      this.fabricApiDownloadURL
    );
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
    if (!fs.existsSync(fabricApiPath)) {
      FrogDownloadManager.downloadByURL(
        this.fabricApiDownloadURL,
        fabricApiPath,
        (dlRes) => {
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
        }
      );
    } else {
      fs.copyFileSync(fabricApiPath, fabricApiPathDest);
      cb(true);
    }
  }

  // Function for download Sodium
  prepareForLaunchStep2(cb) {
    if (this.sodiumDownloadURL == false) {
      cb();
      return;
    }
    var sodiumFilename = FrogUtils.getFilenameFromURL(this.sodiumDownloadURL);
    var sodiumPath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      sodiumFilename
    );
    var sodiumPathDest = path.join(
      mainConfig.selectedBaseDirectory,
      "mods",
      sodiumFilename
    );
    if (!fs.existsSync(sodiumPath)) {
      FrogDownloadManager.downloadByURL(
        this.sodiumDownloadURL,
        sodiumPath,
        (dlRes) => {
          if (dlRes == true) {
            fs.copyFileSync(sodiumPath, sodiumPathDest);
            cb(true);
          } else {
            Toaster(
              "Ошибка при скачивании sodium<br>DLRES_IS_FALSE",
              4000,
              false,
              "error"
            );
            cb(false);
          }
        }
      );
    } else {
      fs.copyFileSync(sodiumPath, sodiumPathDest);
      cb(true);
    }
  }

  // Function for download Iris
  prepareForLaunchStep3(cb) {
    if (this.irisDownloadURL == false) {
      cb();
      return;
    }
    var irisFilename = FrogUtils.getFilenameFromURL(this.irisDownloadURL);
    var irisPath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      irisFilename
    );
    var irisPathDest = path.join(
      mainConfig.selectedBaseDirectory,
      "mods",
      irisFilename
    );
    if (!fs.existsSync(irisPath)) {
      FrogDownloadManager.downloadByURL(
        this.irisDownloadURL,
        irisPath,
        (dlRes) => {
          if (dlRes == true) {
            fs.copyFileSync(irisPath, irisPathDest);
            cb(true);
          } else {
            Toaster(
              "Ошибка при скачивании iris<br>DLRES_IS_FALSE",
              4000,
              false,
              "error"
            );
            cb(false);
          }
        }
      );
    } else {
      fs.copyFileSync(irisPath, irisPathDest);
      cb(true);
    }
  }

  launch() {
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start FabricSodiumIris",
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
