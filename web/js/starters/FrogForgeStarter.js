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
    FrogGeneralStarter.launchGeneral(this.options, "Forge");
  }
}
