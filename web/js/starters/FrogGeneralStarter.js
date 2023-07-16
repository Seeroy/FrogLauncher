class FrogGeneralStarter{
  static launchGeneral(options, displayName){
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start",
      displayName,
      options.version.number
    );
    launcher.launch(options);
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
        FrogNotifyModal.create("О нет, что-то пошло не так", "Minecraft завершился с кодом ошибки " + e + "<br>Подрбоная информация в консоли", "Закрыть", "warning");
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