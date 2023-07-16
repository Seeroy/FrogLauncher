class FrogUtils {
  static fileExt(file) {
    return path.extname(file);
  }

  static getFilenameFromURL(url) {
    return url.split("/").splice(-1)[0];
  }

  static capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  static checkMatchArray(array, text) {
    var isMatches = false;
    array.forEach(function (status) {
      if (text.match(status) != null) {
        isMatches = true;
      }
    });
    return isMatches;
  }

  static createNeccesaryDirs() {
    var mcNeccesaryDirs = ["javas", "cache", "versions", "assets", "natives"];
    mcNeccesaryDirs.forEach((dir) => {
      var fullPath = path.join(mainConfig.selectedBaseDirectory, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, {
          recursive: true,
        });
      }
    });
    if (
      !fs.existsSync(
        path.join(mainConfig.selectedBaseDirectory, "launcher_profiles.json")
      )
    ) {
      fs.writeFileSync(
        path.join(mainConfig.selectedBaseDirectory, "launcher_profiles.json"),
        "{}"
      );
    }
    if (!fs.existsSync(path.join(mainConfig.selectedBaseDirectory, "cache"))) {
      fs.mkdirSync(path.join(mainConfig.selectedBaseDirectory, "cache"), {
        recursive: true,
      });
    }
    if (!fs.existsSync(path.join(__appData, "logs"))) {
      fs.mkdirSync(path.join(__appData, "logs"), { recursive: true });
    }
    if (!fs.existsSync(path.join(__appData, "AppCache"))) {
      fs.mkdirSync(path.join(__appData, "AppCache"), {
        recursive: true,
      });
    }
  }
}
