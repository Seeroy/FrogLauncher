class FrogGeneralStarter {
  static launchGeneral(options, displayName) {
    if (options.version.number.split(".")[1] == "16") {
      var authlibDirPath = path.join(
        mainConfig.selectedBaseDirectory,
        "libraries",
        "com",
        "mojang",
        "authlib",
        modloadersMyInfo.authlibs["16"].directory
      );
      var authlibFilePath = path.join(
        authlibDirPath,
        modloadersMyInfo.authlibs["16"].filename
      );

      if (!fs.existsSync(authlibFilePath)) {
        fs.mkdirSync(authlibDirPath, {recursive: true});
        FrogDownloadManager.downloadByURL(
          modloadersMyInfo.authlibs["16"].url,
          authlibFilePath,
          () => {
            this.proceedToLaunch(options, displayName);
          }
        );
      } else if (
        crypto
          .createHash("md5")
          .update(fs.readFileSync(authlibFilePath))
          .digest("hex")
          .toUpperCase() != modloadersMyInfo.authlibs["16"].md5
      ) {
        fs.mkdirSync(authlibDirPath, {recursive: true});
        fs.unlinkSync(authlibFilePath);
        FrogDownloadManager.downloadByURL(
          modloadersMyInfo.authlibs["16"].url,
          authlibFilePath,
          () => {
            this.proceedToLaunch(options, displayName);
          }
        );
      } else {
        this.proceedToLaunch(options, displayName);
      }
    } else {
      this.proceedToLaunch(options, displayName);
    }
  }

  static proceedToLaunch(options, displayName) {
    var launcher = new Client();
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start",
      displayName,
      options.version.number
    );
    launcher.launch(options);
    launcher.on("debug", (e) => {
      FrogErrorsParser.parse(e);
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
    });
    launcher.on("close", (e) => {
      FrogStartManager.parseStartStatus("mclc-close-evt");
      FrogErrorsParser.parse("", e);
    });
    launcher.on("data", (e) => {
      FrogBackendCommunicator.logBrowserConsoleOnly(e);
      FrogStartManager.parseStartStatus(e);
      FrogErrorsParser.parse(e);
    });
    launcher.on("arguments", (e) => {
      anyDownloading = false;
      FrogStartManager.parseStartStatus("mclc-start-evt");
    });
    launcher.on("download-status", function (e) {
      FrogDownloadManager.handleDownloadStatus(e);
    });
    launcher.on("progress", function (e) {
      FrogDownloadManager.handleProgressStatus(e);
    });
  }
}
