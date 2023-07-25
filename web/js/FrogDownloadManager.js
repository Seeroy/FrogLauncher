var downloadTasks;
var downloadsID = {};
const DOWNLOAD_ITEM =
  '<div class="download-item flex items-center p-2 rounded" id="$3"> <p class="font-semibold grow text-white">$1</p> <div class="w-full rounded-full h-1.5 bg-gray-700" style="max-width: 290px;"> <div class="bg-primary-600 h-1.5 rounded-full" style="width: $2%" ></div> </div> <span class="text-white ml-2 percent-number">$2%</span> </div>';

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
          "Распаковка Java..."
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

  static handleDownloadStatus(e) {
    var downloadPercent = Math.round((e.current * 100) / e.total);
    var encName;
    if(typeof downloadsID[e.name] !== "undefined"){
      encName = downloadsID[e.name];
    } else {
      encName = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
      downloadsID[e.name] = encName;
    }
    if (e.total > 100 && e.current > 0) {
      if (downloadPercent < 100) {
        if ($(".downloads-container .downloads-list #" + encName).length == 0) {
          $(".downloads-container .downloads-list").prepend(
            DOWNLOAD_ITEM.replaceAll(/\$1/gim, e.name)
              .replaceAll(/\$2/gim, downloadPercent)
              .replaceAll(/\$3/gim, encName)
          );
        } else {
          $(
            ".downloads-container .downloads-list #" +
              encName +
              " .rounded-full div"
          ).css("width", downloadPercent + "%");
          $(
            ".downloads-container .downloads-list #" +
              encName +
              " .percent-number"
          ).text(downloadPercent + "%");
        }
      } else {
        if (
          $(".downloads-container .downloads-list #" + encName).data(
            "completed"
          ) != "completed"
        ) {
          $(".downloads-container .downloads-list #" + encName).data(
            "completed",
            "completed"
          );
          $(
            ".downloads-container .downloads-list #" +
              encName +
              " .rounded-full"
          ).remove();
          $(
            ".downloads-container .downloads-list #" +
              encName +
              " .percent-number"
          ).remove();
          $(".downloads-container .downloads-list #" + encName).append(
            "<span class='text-white'>Завершено</span>"
          );
          $(".downloads-container .downloads-list #" + encName)
            .delay(2500)
            .queue(function () {
              animateCSSJ(
                ".downloads-container .downloads-list #" + encName,
                "fadeOut",
                false
              ).then(() => {
                $(this).remove();
              });
            });
        }
      }
    }
  }

  static handleProgressStatus(e) {
    var percent = Math.round((e.task * 100) / e.total);
    FrogUI.setBottomProgressDescription(
      "Скачивание " + e.type + " (" + e.task + " из " + e.total + ")"
    );
    FrogUI.setBottomProgressBar(percent);
  }
}
