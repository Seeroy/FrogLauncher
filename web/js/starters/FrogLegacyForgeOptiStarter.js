class FrogLegacyForgeOptiStarter {
  constructor(opts, ourl) {
    this.options = opts;
    this.ofDownloadURL = ourl;
  }

  prepareForLaunchStep1(cb) {
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
      FrogUI.changeBottomControlsStatus(false, true, true);
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
