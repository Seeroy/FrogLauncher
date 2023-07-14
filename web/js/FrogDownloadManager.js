var downloadTasks;
const DOWNLOAD_ITEM =
  '<div class="download-item flex items-center p-2 rounded" id="$3"> <p class="font-semibold grow text-white">$1 (<span class="filesize">$2</span> Мб)</p> <div class="w-full rounded-full h-1.5 bg-gray-700"> <div class="bg-primary-600 h-1.5 rounded-full" style="width: $2%" ></div> </div> <span class="text-white ml-2 percent-number">$2%</span> </div>';

class FrogDownloadManager {
  static downloadJava(version, cb) {
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
      .on("error", function (err) {
        console.log(err);
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
            cb(true);
          })
          .catch((error) => {
            FrogBackendCommunicator.logBrowserConsole(
              "[DL]",
              "Error when unpacking! " + error.toString()
            );
            cb(error);
          });
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
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static handleDownloadStatus(e) {
    var downloadPercent = Math.round((e.current * 100) / e.total);
    var totalFileSize = (e.total / 1024 / 1024).toFixed(2);
    var encName = encodeURIComponent(e.name).replaceAll(/\./g, "");
    if(e.total > 100 && e.current > 0){
    if (downloadPercent < 100) {
      if ($(".downloads-container .downloads-list #" + encName).length == 0) {
        $(".downloads-container .downloads-list").prepend(
          DOWNLOAD_ITEM.replaceAll(/\$1/gim, e.name)
            .replaceAll(/\$2/gim, downloadPercent)
            .replaceAll(/\$3/gim, encName)
            .replaceAll(/\$4/gim, totalFileSize)
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
        $(
          ".downloads-container .downloads-list #" + encName + " .filesize"
        ).text(totalFileSize);
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
          ".downloads-container .downloads-list #" + encName + " .rounded-full"
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
          .delay(5000)
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
