class FrogForgeCompiler {
  // Function for generating forge start args
  static compileForgeArguments(
    rootDirectory,
    version,
    authData,
    maxMemory,
    javaPath = "java.exe",
    forgeFile
  ) {
    var launch_arguments = {
      authorization: authData,
      root: rootDirectory,
      cache: path.join(rootDirectory, "cache"),
      version: {
        number: version,
        type: "release",
      },
      forge: forgeFile,
      javaPath: javaPath,
      memory: {
        max: maxMemory,
        min: "1G",
      },
      overrides: {
        gameDirectory: rootDirectory,
        maxSockets: 2,
      },
    };
    return launch_arguments;
  }

  // Forge start process
  static startForge(version, url, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, forgeStarter;
    var forgeFilename = FrogUtils.getFilenameFromURL(url);
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogStartManager.getFinalJavaPath(version, (finalJP) => {
        startArguments = this.compileForgeArguments(
          mainConfig.selectedBaseDirectory,
          version,
          authData,
          memory,
          finalJP,
          path.join(mainConfig.selectedBaseDirectory, "cache", forgeFilename)
        );
        forgeStarter = new FrogForgeStarter(startArguments, url);
        forgeStarter.prepareForLaunch(() => {
          forgeStarter.launch();
        });
      });
    });
  }

  // ForgeOptiFine start process
  static startForgeOptiFine(version, furl, ourl, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, forgeOptiStarter;
    var forgeFilename = FrogUtils.getFilenameFromURL(furl);
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
    FrogStartManager.getFinalJavaPath(version, (finalJP) => {
      startArguments = this.compileForgeArguments(
        mainConfig.selectedBaseDirectory,
        version,
        authData,
        memory,
        finalJP,
        path.join(mainConfig.selectedBaseDirectory, "cache", forgeFilename)
      );
      forgeOptiStarter = new FrogForgeOptiStarter(startArguments, furl, ourl);
      forgeOptiStarter.prepareForLaunchStep1(() => {
        forgeOptiStarter.prepareForLaunchStep2(() => {
          forgeOptiStarter.launch();
        });
      });
    });
  });
  }

  static getFDataByVersion(version, cb) {
    var retValue = false;
    FrogVersionsManager.getForgeReleases((forge_releases) => {
      for (const [key, value] of Object.entries(forge_releases)) {
        if (key == version) {
          retValue = this.compileDataFromRaw("", key, "forge", value);
        }
      }
      cb(retValue);
    });
  }

  static getFODataByVersion(version, cb) {
    var fres = false;
    var ofres = false;
    FrogVersionsManager.getForgeReleases((forge_releases) => {
      for (const [key, value] of Object.entries(forge_releases)) {
        if (key == version) {
          fres = value;
          for (const [key2, value2] of Object.entries(
            modloadersMyInfo.optifine
          )) {
            if (key2 == version) {
              ofres = value2;
            }
          }
        }
      }
      if (fres != false && ofres != false) {
        cb(this.compileDataFromRaw("", version, "forgeoptifine", fres, ofres));
      } else {
        cb(false);
      }
    });
  }

  static compileDataFromRaw(
    installedVersions = "",
    version,
    type,
    forgeUrl = "",
    ofUrl = ""
  ) {
    var foInstalled = false, fInstalled = false;
    if (installedVersions == "") {
      installedVersions = FrogVersionsManager.getInstalledVersionsList();
    }
    if(installedVersions.includes("ForgeOptiFine " + version)){
      installedVersionsChk.splice(installedVersionsChk.indexOf("ForgeOptiFine " + version), 1);
      foInstalled = true;
    }
    if(installedVersions.includes("Forge " + version)){
      installedVersionsChk.splice(installedVersionsChk.indexOf("Forge " + version), 1);
      fInstalled = true;
    }
    if (type == "forgeoptifine") {
      return {
        shortName: "forgeoptifine-" + version,
        version: version,
        forgeUrl: forgeUrl,
        ofUrl: ofUrl,
        type: "forgeoptifine",
        installed: foInstalled,
      };
    } else {
      return {
        shortName: "forge-" + version,
        version: version,
        url: forgeUrl,
        type: "forge",
        installed: fInstalled,
      };
    }
  }
}
