var downloadTasks;

class FrogDownloadManager {
  static downloadJava(version, cb) {
    var javaURL, downloadPath, decompressPath;
    if (process.platform == "win32" && process.arch == "x64") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" + version + "/ga/windows/x64/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "win32" && process.arch == "ia32") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" + version + "/ga/windows/x86/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "linux" && process.arch == "x64") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" + version + "/ga/linux/x64/jre/hotspot/normal/eclipse?project=jdk";
    } else if (process.platform == "linux" && process.arch == "ia32") {
      javaURL =
        "https://api.adoptium.net/v3/binary/latest/" + version + "/ga/linux/x86/jre/hotspot/normal/eclipse?project=jdk";
    }

    downloadPath = path.join(mainConfig.selectedBaseDirectory, "javas", "JRE_" + version + ".zip");
    decompressPath = path.join(mainConfig.selectedBaseDirectory, "javas", "J" + version);

    FrogUI.changeBottomControlsStatus(false, true, true, "Скачивание Java " + version);

    var received_bytes = 0;
    var total_bytes = 0;
    var percent = "";

    FrogBackendCommunicator.logBrowserConsole(
      "[DL]",
      "Starting download of Java JRE", version
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
        FrogUI.changeBottomControlsStatus(false, false, true, "Распаковка Java...");
        FrogBackendCommunicator.logBrowserConsole(
          "[DL]",
          "Download success! Unpacking...",
        );
        decompress(downloadPath, decompressPath)
          .then((files) => {
            FrogBackendCommunicator.logBrowserConsole(
              "[DL]",
              "Unpacking success",
            );
            fs.unlinkSync(downloadPath);
            cb(true);
          })
          .catch((error) => {
            FrogBackendCommunicator.logBrowserConsole(
              "[DL]",
              "Error when unpacking! " + error.toString(),
            );
            cb(error);
          });
      });
  }

  static isRequestedJavaExistsLocally(version){
    var javaExpectedPath = path.join(mainConfig.selectedBaseDirectory, "javas", "J" + version);
    if(fs.existsSync(javaExpectedPath)){
      var javaDirScan = fs.readdirSync(javaExpectedPath);
      var javaDirName = javaDirScan[0];
      if(process.platform == "win32"){
        var javaBinaryPath = path.join(javaExpectedPath, javaDirName, "bin", "java.exe");
      } else {
        var javaBinaryPath = path.join(javaExpectedPath, javaDirName, "bin", "java");
      }
      if(fs.existsSync(javaBinaryPath)){
       return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
