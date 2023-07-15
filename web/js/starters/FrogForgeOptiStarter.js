class FrogForgeOptiStarter {
  constructor(opts, furl, ourl) {
    this.options = opts;
    this.forgeDownloadURL = furl;
    this.ofDownloadURL = ourl;
  }

  prepareForLaunchStep1(cb) {
    console.log(this.forgeDownloadURL);
    var forgeFilename = FrogUtils.getFilenameFromURL(this.forgeDownloadURL);
    var forgePath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      forgeFilename
    );
    if (!fs.existsSync(forgePath)) {
      FrogDownloadManager.downloadByURL(
        this.forgeDownloadURL,
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

  prepareForLaunchStep2(cb) {
    var ofFilename = FrogUtils.getFilenameFromURL(this.ofDownloadURL);
    var ofPath = path.join(
      mainConfig.selectedBaseDirectory,
      "cache",
      ofFilename
    );
    var ofPathDest = path.join(
      mainConfig.selectedBaseDirectory,
      "mods",
      ofFilename
    );
    FrogForgeOptiStarter.removeOldOptiFine();
    if (!fs.existsSync(ofPath)) {
      FrogDownloadManager.downloadByURL(this.ofDownloadURL, ofPath, (dlRes) => {
        if (dlRes == true) {
          fs.copyFileSync(ofPath, ofPathDest);
          cb(true);
        } else {
          Toaster(
            "Ошибка при скачивании OptiFine<br>DLRES_IS_FALSE",
            4000,
            false,
            "error"
          );
          cb(false);
        }
      });
    } else {
      fs.copyFileSync(ofPath, ofPathDest);
      cb(true);
    }
  }

  launch() {
    FrogStartManager.parseStartStatus("mclc-start-evt");
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start ForgeOptiFine Minecraft",
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

  static removeOldOptiFine() {
    var rdir = fs.readdirSync(
      path.join(mainConfig.selectedBaseDirectory, "mods")
    );
    rdir.forEach(function (dr) {
      if (dr.match(/.*OptiFine.*/gim) != null) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
      }
    });
    return true;
  }
}
