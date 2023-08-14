class FrogLegacyForgeCompiler {
  // Function for generating LegacyForge start args
  static compileForgeArguments(
    rootDirectory,
    version,
    authData,
    maxMemory,
    javaPath = "java.exe",
    directoryPath
  ) {
    var launch_arguments = {
      authorization: authData,
      root: rootDirectory,
      cache: path.join(rootDirectory, "cache"),
      version: {
        number: version,
        type: "release",
        custom: directoryPath,
      },
      javaPath: javaPath,
      memory: {
        max: maxMemory,
        min: "1500M",
      },
      overrides: {
        gameDirectory: rootDirectory,
        maxSockets: 4,
      },
    };
    return launch_arguments;
  }

  // LegacyForge start process
  static startForge(version, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, legacyForgeStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Проверка установки Forge"
      );
      // Get version of Forge
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameData) => {
          // Is Forge installed?
          if (gameData.installed == true) {
            FrogUI.changeBottomControlsStatus(
              false,
              false,
              true,
              "Генерация аргументов"
            );
            // Generating arguments and starting
            FrogStartManager.getFinalJavaPath(version, (finalJP) => {
              startArguments = this.compileForgeArguments(
                mainConfig.selectedBaseDirectory,
                version,
                authData,
                memory,
                finalJP,
                "Forge" + version
              );
              FrogUI.changeBottomControlsStatus(false, true, true);
              legacyForgeStarter = new FrogLegacyForgeStarter(startArguments);
              legacyForgeStarter.launch();
            });
          } else {
            // Creting necessary dirs
            fs.mkdirSync(
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "Forge" + version
              ),
              { recursive: true }
            );
            // Downloading JSON for Forge version
            FrogDownloadManager.downloadByURL(
              modloadersMyInfo.forgeLegacy[version],
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "Forge" + version,
                FrogUtils.getFilenameFromURL(
                  modloadersMyInfo.forgeLegacy[version]
                )
              ),
              (dlRes) => {
                // Restarting startLegacyForge process after success download
                if (dlRes == true) {
                  this.startForge(version, memory);
                }
              }
            );
          }
        }
      );
    });
  }

  // LegacyForgeOptiFine start process
  static startForgeOptiFine(version, ourl, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, legacyForgeOptiStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Проверка установки Forge"
      );
      // Get version of Forge
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion.replace("legacyforgeoptifine", "legacyforge"),
        (gameDataForge) => {
          // Is Forge installed?
          if (gameDataForge.installed == true) {
            FrogUI.changeBottomControlsStatus(
              false,
              false,
              true,
              "Генерация аргументов"
            );
            // Generating arguments and starting
            FrogStartManager.getFinalJavaPath(version, (finalJP) => {
              startArguments = this.compileForgeArguments(
                mainConfig.selectedBaseDirectory,
                version,
                authData,
                memory,
                finalJP,
                "Forge" + version
              );
              FrogUI.changeBottomControlsStatus(false, true, true);
              legacyForgeOptiStarter = new FrogLegacyForgeOptiStarter(
                startArguments,
                ourl
              );
              legacyForgeOptiStarter.prepareForLaunchStep1(() => {
                legacyForgeOptiStarter.launch();
              });
            });
          } else {
            // Creting necessary dirs
            fs.mkdirSync(
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "Forge" + version
              ),
              { recursive: true }
            );
            // Downloading JSON for Forge version
            FrogDownloadManager.downloadByURL(
              modloadersMyInfo.forgeLegacy[version],
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "Forge" + version,
                FrogUtils.getFilenameFromURL(
                  modloadersMyInfo.forgeLegacy[version]
                )
              ),
              (dlRes) => {
                // Restarting startLegacyForge process after success download
                if (dlRes == true) {
                  this.startForgeOptiFine(version, ourl, memory);
                }
              }
            );
          }
        }
      );
    });
  }

  static getFDataByVersion(version, cb) {
    var retValue = false;
    FrogVersionsManager.getLegacyForgeReleases((leg_forge_releases) => {
      for (const [key, value] of Object.entries(leg_forge_releases)) {
        if (key == version) {
          retValue = this.compileDataFromRaw("", key, "legacyforge", value);
        }
      }
      cb(retValue);
    });
  }

  static getFODataByVersion(version, cb) {
    var fres = false;
    var ofres = false;
    FrogVersionsManager.getLegacyForgeReleases((forge_releases) => {
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
        cb(
          this.compileDataFromRaw(
            "",
            version,
            "legacyforgeoptifine",
            fres,
            ofres
          )
        );
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
    var foInstalled = false,
      fInstalled = false;
    if (installedVersions == "") {
      installedVersions = FrogVersionsManager.getInstalledVersionsList();
    }
    if (installedVersions.includes("ForgeOptiFineLegacy " + version)) {
      installedVersionsChk.splice(
        installedVersionsChk.indexOf("ForgeOptiFineLegacy " + version),
        1
      );
      foInstalled = true;
    }
    if (installedVersions.includes("ForgeLegacy " + version)) {
      installedVersionsChk.splice(
        installedVersionsChk.indexOf("ForgeLegacy " + version),
        1
      );
      fInstalled = true;
    }
    if (type == "legacyforgeoptifine") {
      return {
        shortName: "legacyforgeoptifine-" + version,
        version: version,
        forgeUrl: forgeUrl,
        ofUrl: ofUrl,
        type: "legacyforgeoptifine",
        installed: foInstalled,
      };
    } else {
      return {
        shortName: "legacyforge-" + version,
        version: version,
        url: forgeUrl,
        type: "legacyforge",
        installed: fInstalled,
      };
    }
  }
}
