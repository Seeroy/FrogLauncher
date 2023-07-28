class FrogFabricCompiler {
  // Function for generating Fabric start args
  static compileFabricArguments(
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

  // Fabric start process
  static startFabric(version, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, fabricStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Проверка установки Fabric"
      );
      // Get version of Fabric
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameData) => {
          // Is Fabric installed?
          if (gameData.installed == true) {
            FrogUI.changeBottomControlsStatus(
              false,
              false,
              true,
              "Генерация аргументов"
            );
            // Generating arguments and starting
            var fabInfo =
              FrogVersionsManager.getFabricDirectoryByVersion(version);
            FrogStartManager.getFinalJavaPath(version, (finalJP) => {
              FrogVersionsManager.getFabricAPIReleases((fapiReleases) => {
                var fapiUrl = false;
                if (
                  typeof fapiReleases[version] !== "undefined" &&
                  fapiReleases[version] != null
                ) {
                  fapiUrl = fapiReleases[version];
                }
                startArguments = this.compileFabricArguments(
                  mainConfig.selectedBaseDirectory,
                  version,
                  authData,
                  memory,
                  finalJP,
                  fabInfo["directoryName"]
                );
                FrogUI.changeBottomControlsStatus(false, true, true);
                fabricStarter = new FrogFabricStarter(startArguments, fapiUrl);
                fabricStarter.prepareForLaunchStep1(() => {
                  FrogUI.changeBottomControlsStatus(false, true, true);
                  fabricStarter.launch();
                });
              });
            });
          } else {
            // Creting necessary dirs
            fs.mkdirSync(
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "fabric-loader-" +
                  modloadersMyInfo.fabric.latestLoaderVersion +
                  "-" +
                  version
              ),
              { recursive: true }
            );
            // Downloading Fabric JSON
            FrogDownloadManager.downloadByURL(
              modloadersMyInfo.fabric.versions[version],
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "fabric-loader-" +
                  modloadersMyInfo.fabric.latestLoaderVersion +
                  "-" +
                  version,
                FrogUtils.getFilenameFromURL(
                  modloadersMyInfo.fabric.versions[version]
                )
              ),
              (dlRes) => {
                // Restarting startFabric process after success download
                if (dlRes == true) {
                  this.startFabric(version, memory);
                }
              }
            );
          }
        }
      );
    });
  }

  static getFabDataByVersion(version, cb) {
    var retValue = false;
    var fabric_versions = FrogVersionsManager.getFabricAvailableVersions();
    fabric_versions.forEach((fabric_version) => {
      if (fabric_version == version) {
        retValue = this.compileDataFromRaw(
          "",
          fabric_version,
          "fabric",
          "Fabric"
        );
      }
    });
    cb(retValue);
  }

  // FabricSodium start process
  static startFabricSodium(version, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, fabricStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Проверка установки Fabric"
      );
      // Get version of Fabric
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameData) => {
          // Is Fabric installed?
          if (gameData.installed == true) {
            FrogUI.changeBottomControlsStatus(
              false,
              false,
              true,
              "Генерация аргументов"
            );
            // Generating arguments and starting
            var fabInfo =
              FrogVersionsManager.getFabricDirectoryByVersion(version);
            FrogStartManager.getFinalJavaPath(version, (finalJP) => {
              FrogVersionsManager.getFabricAPIReleases((fapiReleases) => {
                FrogVersionsManager.getSodiumReleases((sodReleases) => {
                  FrogVersionsManager.getIrisReleases((irisReleases) => {
                    var fapiUrl,
                      sodUrl,
                      irisUrl = false;
                    if (
                      typeof fapiReleases[version] !== "undefined" &&
                      fapiReleases[version] != null
                    ) {
                      fapiUrl = fapiReleases[version];
                    }
                    if (
                      typeof sodReleases[version] !== "undefined" &&
                      sodReleases[version] != null
                    ) {
                      sodUrl = sodReleases[version];
                    }
                    if (
                      typeof irisReleases[version] !== "undefined" &&
                      irisReleases[version] != null
                    ) {
                      irisUrl = irisReleases[version];
                    }
                    startArguments = this.compileFabricArguments(
                      mainConfig.selectedBaseDirectory,
                      version,
                      authData,
                      memory,
                      finalJP,
                      fabInfo["directoryName"]
                    );
                    FrogUI.changeBottomControlsStatus(false, true, true);
                    fabricStarter = new FrogFabricSodiumStarter(
                      startArguments,
                      fapiUrl,
                      sodUrl,
                      irisUrl
                    );
                    fabricStarter.prepareForLaunchStep1(() => {
                      FrogUI.changeBottomControlsStatus(false, true, true);
                      fabricStarter.prepareForLaunchStep2(() => {
                        FrogUI.changeBottomControlsStatus(false, true, true);
                        fabricStarter.prepareForLaunchStep3(() => {
                          FrogUI.changeBottomControlsStatus(false, true, true);
                          fabricStarter.launch();
                        });
                      });
                    });
                  });
                });
              });
            });
          } else {
            // Creting necessary dirs
            fs.mkdirSync(
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "fabric-loader-" +
                  modloadersMyInfo.fabric.latestLoaderVersion +
                  "-" +
                  version
              ),
              { recursive: true }
            );
            // Downloading Fabric JSON
            FrogDownloadManager.downloadByURL(
              modloadersMyInfo.fabric.versions[version],
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "fabric-loader-" +
                  modloadersMyInfo.fabric.latestLoaderVersion +
                  "-" +
                  version,
                FrogUtils.getFilenameFromURL(
                  modloadersMyInfo.fabric.versions[version]
                )
              ),
              (dlRes) => {
                // Restarting startFabric process after success download
                if (dlRes == true) {
                  this.startFabric(version, memory);
                }
              }
            );
          }
        }
      );
    });
  }

  static getFabSodDataByVersion(version, cb) {
    var retValue = false;
    var fabric_versions = FrogVersionsManager.getFabricAvailableVersions();
    fabric_versions.forEach((fabric_version) => {
      if (fabric_version == version) {
        retValue = this.compileDataFromRaw(
          "",
          fabric_version,
          "fabricsodiumiris",
          "FabricSodiumIris"
        );
      }
    });
    cb(retValue);
  }

  // Quilt start process
  static startQuilt(version, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, quiltStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Проверка установки Quilt"
      );
      // Get version of Quilt
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameData) => {
          // Is Quilt installed?
          if (gameData.installed == true) {
            FrogUI.changeBottomControlsStatus(
              false,
              false,
              true,
              "Генерация аргументов"
            );
            // Generating arguments and starting
            var qInfo = FrogVersionsManager.getQuiltDirectoryByVersion(version);
            FrogStartManager.getFinalJavaPath(version, (finalJP) => {
              startArguments = this.compileFabricArguments(
                mainConfig.selectedBaseDirectory,
                version,
                authData,
                memory,
                finalJP,
                qInfo["directoryName"]
              );
              FrogUI.changeBottomControlsStatus(false, true, true);
              quiltStarter = new FrogQuiltStarter(startArguments);
              quiltStarter.launch();
            });
          } else {
            // Creting necessary dirs
            fs.mkdirSync(
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "quilt-loader-" +
                  modloadersMyInfo.quilt.latestLoaderVersion +
                  "-" +
                  version
              ),
              { recursive: true }
            );
            // Downloading Quilt JSON
            FrogDownloadManager.downloadByURL(
              modloadersMyInfo.quilt.versions[version],
              path.join(
                mainConfig.selectedBaseDirectory,
                "versions",
                "quilt-loader-" +
                  modloadersMyInfo.quilt.latestLoaderVersion +
                  "-" +
                  version,
                FrogUtils.getFilenameFromURL(
                  modloadersMyInfo.quilt.versions[version]
                )
              ),
              (dlRes) => {
                // Restarting startQuilt process after success download
                if (dlRes == true) {
                  this.startQuilt(version, memory);
                }
              }
            );
          }
        }
      );
    });
  }

  static getQuiltDataByVersion(version, cb) {
    var retValue = false;
    var quilt_versions = FrogVersionsManager.getQuiltAvailableVersions();
    quilt_versions.forEach((quilt_version) => {
      if (quilt_version == version) {
        retValue = this.compileDataFromRaw("", quilt_version, "quilt", "Quilt");
      }
    });
    cb(retValue);
  }

  static compileDataFromRaw(installedVersions = "", version, type, searchName) {
    var fabInstalled = false;
    if (installedVersions == "") {
      installedVersions = FrogVersionsManager.getInstalledVersionsList();
    }
    if(installedVersions.includes(searchName + " " + version)){
      installedVersionsChk.splice(installedVersionsChk.indexOf(searchName + " " + version), 1);
      fabInstalled = true;
    }
    var retValue = {
      shortName: type + "-" + version,
      version: version,
      type: type,
      installed: fabInstalled,
    };
    return retValue;
  }
}
