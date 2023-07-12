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
      "Eclipse Foundation"
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
}

function round512(x) {
  return Math.ceil(x / 512) * 512;
}