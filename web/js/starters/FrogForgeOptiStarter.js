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
    FrogStartManager.deleteTemporaryMods();
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
    FrogGeneralStarter.launchGeneral(this.options, "ForgeOptiFine");
  }
}
