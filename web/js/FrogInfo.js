class FrogInfo {
  static getJavaBinariesList = () => {
    var directories = [
      "C:/Program Files",
      "C:/Program Files(x86)",
      "C:/Program Files (x86)",
    ];
    var tree = [
      "Java",
      "JDK",
      "OpenJDK",
      "OpenJRE",
      "Adoptium",
      "JRE",
      "AdoptiumJRE",
      "Temurin",
      "Eclipse Foundation",
    ];
    var javas = [];
    directories.forEach(function (mainDir) {
      tree.forEach(function (inner) {
        var directory = mainDir + "/" + inner;
        if (fs.existsSync(directory)) {
          fs.readdirSync(directory).forEach(function (jvs) {
            if (fs.existsSync(directory + "/" + jvs + "/bin/java.exe")) {
              javas.push(directory + "/" + jvs + "/bin/java.exe");
            }
          });
        }
      });
    });
    return javas;
  };

  static getMaxRAMSize = () => {
    return round512(Math.round(os.totalmem() / 1024 / 1024));
  };

  static getDefaultDotMinecraft = () => {
    if (process.platform == "win32") {
      return path.join(os.homedir(), "AppData", "Roaming", ".minecraft");
    } else {
      return path.join(__dirname, "minecraft");
    }
  };

  static gameVersionToJavaVersion = (gameVersion) => {
    var java = 8;
    if (typeof gameVersion !== "undefined") {
      var sec = gameVersion.split(".")[1];
      var ter = gameVersion.split(".")[2];
      if (sec < 8) {
        java = 8;
      } else if (sec >= 8 && sec <= 11) {
        java = 8;
      } else if (sec >= 12 && sec <= 15) {
        java = 11;
      } else if (sec == 16) {
        if (ter <= 4) {
          java = 11;
        } else {
          java = 17;
        }
      } else if (sec >= 17) {
        java = 17;
      } else if (sec >= 20) {
        java = 20;
      }
      return java;
    } else {
      return false;
    }
  };
}

function round512(x) {
  return Math.ceil(x / 512) * 512;
}
