var downloadTasks;
var downloadsID = {};
const DOWNLOAD_ITEM =
  '<div class="download-item flex flex-col items-center p-2 rounded" id="$3"> <div class="flex items-center w-full text-zone"> <span class="material-symbols-rounded text-white mr-2">download</span> <p class="font-semibold grow text-white">$1</p> </div> <div class="flex items-center w-full progress-zone"> <div class="w-full rounded-full h-1.5 bg-gray-700" > <div class="bg-primary-600 h-1.5 rounded-full" style="width: $2%" ></div> </div> <span class="text-white ml-2 percent-number">$2%</span> </div> </div>';

class FrogDownloadManager {
  static downloadJava(version, cb) {
    anyDownloading = true;
    var javaURL, downloadPath, decompressPath;
    if (process.platform == "win32" && process.arch == "x64") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" +
        version +
        "/ga/windows/x64/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "win32" && process.arch == "ia32") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" +
        version +
        "/ga/windows/x86/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "linux" && process.arch == "x64") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" +
        version +
        "/ga/linux/x64/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "linux" && process.arch == "ia32") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" +
        version +
        "/ga/linux/x86/jre/hotspot/normal/eclipse?project=jdk";
    }

    downloadPath = path.join(
      mainConfig.selectedBaseDirectory,
      "javas",
      "JRE_" + version + ".zip"
    );
    decompressPath = path.join(
      mainConfig.selectedBaseDirectory,
      "javas",
      "J" + version
    );

    FrogUI.changeBottomControlsStatus(
      false,
      true,
      true,
      "Скачивание Java " + version
    );

    var received_bytes = 0;
    var total_bytes = 0;
    var percent = "";

    FrogBackendCommunicator.logBrowserConsole(
      "[DL]",
      "Starting download of Java JRE",
      version
    );

    request
      .get(javaURL)
      .on("error", function (error) {
        cb(error);
      })
      .on("response", function (data) {
        total_bytes = parseInt(data.headers["content-length"]);
        data.pipe(fs.createWriteStream(downloadPath));
      })
      .on("data", function (chunk) {
        received_bytes += chunk.length;
        percent = Math.round((received_bytes * 100) / total_bytes);
        FrogUI.setBottomProgressBar(percent);
      })
      .on("end", function () {
        FrogUI.setBottomProgressBar(0);
        FrogUI.changeBottomControlsStatus(
          false,
          false,
          true,
          "Распаковка Java"
        );
        FrogBackendCommunicator.logBrowserConsole(
          "[DL]",
          "Download success! Unpacking..."
        );
        decompress(downloadPath, decompressPath)
          .then((files) => {
            FrogBackendCommunicator.logBrowserConsole(
              "[DL]",
              "Unpacking success"
            );
            fs.unlinkSync(downloadPath);
            anyDownloading = false;
            cb(true);
          })
          .catch((error) => {
            FrogBackendCommunicator.logBrowserConsole(
              "[DL]",
              "Error when unpacking! " + error.toString()
            );
            anyDownloading = false;
            cb(error);
          });
      });
  }

  static downloadByURL(url, path, cb) {
    anyDownloading = true;
    FrogUI.changeBottomControlsStatus(
      false,
      true,
      true,
      "Скачивание " + FrogUtils.getFilenameFromURL(url)
    );

    var received_bytes = 0;
    var total_bytes = 0;
    var percent = "";

    FrogBackendCommunicator.logBrowserConsole(
      "[DL]",
      "Starting download of " + FrogUtils.getFilenameFromURL(url)
    );

    request
      .get(url)
      .on("error", function (error) {
        cb(error);
        anyDownloading = false;
      })
      .on("response", function (data) {
        total_bytes = parseInt(data.headers["content-length"]);
        data.pipe(fs.createWriteStream(path));
      })
      .on("data", function (chunk) {
        received_bytes += chunk.length;
        percent = Math.round((received_bytes * 100) / total_bytes);
        FrogUI.setBottomProgressBar(percent);
      })
      .on("end", function () {
        FrogUI.setBottomProgressBar(0);
        FrogBackendCommunicator.logBrowserConsole("[DL]", "Download success");
        cb(true);
        anyDownloading = false;
      });
  }

  static isRequestedJavaExistsLocally(version) {
    var javaExpectedPath = path.join(
      mainConfig.selectedBaseDirectory,
      "javas",
      "J" + version
    );
    if (fs.existsSync(javaExpectedPath)) {
      var javaDirScan = fs.readdirSync(javaExpectedPath);
      var javaDirName = javaDirScan[0];
      if (process.platform == "win32") {
        var javaBinaryPath = path.join(
          javaExpectedPath,
          javaDirName,
          "bin",
          "java.exe"
        );
      } else {
        var javaBinaryPath = path.join(
          javaExpectedPath,
          javaDirName,
          "bin",
          "java"
        );
      }
      if (fs.existsSync(javaBinaryPath)) {
        return javaBinaryPath;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static getJavaAutodetectPath(gameVersion, cb) {
    var requiredJavaVersion = FrogInfo.gameVersionToJavaVersion(gameVersion);
    var isExistsLocally =
      this.isRequestedJavaExistsLocally(requiredJavaVersion);
    FrogBackendCommunicator.logBrowserConsoleOnly(
      "[JD]",
      "Starting `Java autodetect path`"
    );
    if (isExistsLocally != false) {
      FrogBackendCommunicator.logBrowserConsoleOnly(
        "[JD]",
        "Ok, Java is detected locally"
      );
      cb(isExistsLocally);
    } else {
      this.downloadJava(requiredJavaVersion, (downloadResult) => {
        if (downloadResult == true) {
          var isExistsLocally2 =
            this.isRequestedJavaExistsLocally(requiredJavaVersion);
          if (isExistsLocally2 != false) {
            cb(isExistsLocally2);
          } else {
            Toaster(
              "Ошибка скачивания Java<br>подробнее в консоли",
              4000,
              false,
              "warning"
            );
            FrogBackendCommunicator.logBrowserConsoleOnly(
              "[JD]",
              "IS_EXISTS_LOCALLY_2 check failure!"
            );
            cb(false);
          }
        } else {
          Toaster(
            "Ошибка скачивания Java<br>подробнее в консоли",
            4000,
            false,
            "warning"
          );
          FrogBackendCommunicator.logBrowserConsoleOnly(
            "[JD]",
            "DOWNLOAD_RESULT check failure!"
          );
          FrogBackendCommunicator.logBrowserConsoleOnly(downloadResult);
          cb(false);
        }
      });
    }
  }

  static handleDownloadStatusV2(e) {
    var downloadPercent = Math.round((e.current * 100) / e.total);
    if (e.total > 1024 * 1024) {
      FrogUI.changeBottomControlsStatus(
        false,
        true,
        true,
        "Скачиваем " + e.name
      );
      FrogUI.setBottomProgressBar(downloadPercent);
    } else {
      if ($(".controls .progress-cont .progress").hasClass("hidden")) {
        FrogUI.changeBottomControlsStatus(
          false,
          false,
          true,
          "Скачиваем " + e.name
        );
      } else {
        FrogUI.setBottomProgressDescription("Скачиваем " + e.name);
      }
    }
  }
}
