class FrogFabricStarter {
  constructor(opts, dlurl) {
    this.options = opts;
    this.fabricApiDownloadURL = dlurl;
  }

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
    FrogStartManager.deleteTemporaryMods();
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

  launch() {
    FrogGeneralStarter.launchGeneral(this.options, "Fabric");
  }
}
