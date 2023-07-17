const STATUS_STARTING = [
  /Setting user\:/gim,
  /Launching wrapped minecraft/gim,
  /ModLauncher running/gim,
  /Launching target \'fmlclient\'/gim,
  /Loading tweak class/gim,
  /Sodium has been successfully discovered and initialized/gim,
];
const STATUS_STARTED = [
  /OpenAL initialized/gim,
  /Sound engine started/gim,
  /Created\: 512x512 textures-atlas/gim,
];
const STATUS_STOPPING = [
  /Stopping!/gim,
  /Author\: Paul Lamb/gim,
  /SoundSystem shutting down\.\.\./gim,
];

class FrogStartManager {
  // Function for generating vanilla start args
  static compileVanillaArguments(
    rootDirectory,
    version,
    authData,
    maxMemory,
    javaPath = "java.exe",
    versionType = "release"
  ) {
    var launch_arguments = {
      authorization: authData,
      root: rootDirectory,
      cache: path.join(rootDirectory, "cache"),
      version: {
        number: version,
        type: versionType,
      },
      javaPath: javaPath,
      memory: {
        max: maxMemory,
        min: "1G",
      },
      overrides: {
        gameDirectory: rootDirectory,
      },
    };
    return launch_arguments;
  }

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
        min: "1500M",
      },
      overrides: {
        gameDirectory: rootDirectory,
      },
    };
    return launch_arguments;
  }

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

  // Vanilla start process
  static startVanilla(version, memory, type = "release") {
    this.prepareUIToStart(true);
    var startArguments, vanillaStarter;
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
    FrogUI.changeBottomControlsStatus(false, true, true);
    this.getFinalJavaPath(version, (finalJP) => {
      startArguments = this.compileVanillaArguments(
        mainConfig.selectedBaseDirectory,
        version,
        authData,
        memory,
        finalJP,
        type
      );
      vanillaStarter = new FrogVanillaStarter(startArguments);
      vanillaStarter.launch();
    });
  }

  // Forge start process
  static startForge(version, url, memory) {
    this.prepareUIToStart(true);
    var startArguments, forgeStarter;
    var forgeFilename = FrogUtils.getFilenameFromURL(url);
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
    FrogUI.changeBottomControlsStatus(false, true, true);
    this.getFinalJavaPath(version, (finalJP) => {
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
  }

  // ForgeOptiFine start process
  static startForgeOptiFine(version, furl, ourl, memory) {
    this.prepareUIToStart(true);
    var startArguments, forgeOptiStarter;
    var forgeFilename = FrogUtils.getFilenameFromURL(furl);
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
    FrogUI.changeBottomControlsStatus(false, true, true);
    this.getFinalJavaPath(version, (finalJP) => {
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
  }

  // Fabric start process
  static startFabric(version, memory) {
    this.prepareUIToStart(true);
    var startArguments, fabricStarter;
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
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
          this.getFinalJavaPath(version, (finalJP) => {
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
                FrogStartManager.startFabric(version, memory);
              }
            }
          );
        }
      }
    );
  }

  // Fabric start process
  static startFabricSodium(version, memory) {
    this.prepareUIToStart(true);
    var startArguments, fabricStarter;
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
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
          this.getFinalJavaPath(version, (finalJP) => {
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
                    fabricStarter.prepareForLaunchStep2(() => {
                      fabricStarter.prepareForLaunchStep3(() => {
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
                FrogStartManager.startFabric(version, memory);
              }
            }
          );
        }
      }
    );
  }

  static parseStartStatus(line) {
    if (line == "mclc-close-evt") {
      this.setGameStatus("stopped");
    } else if (
      (FrogUtils.checkMatchArray(STATUS_STARTING, line) == true &&
        anyDownloading == false) ||
      line == "mclc-start-evt"
    ) {
      this.setGameStatus("starting");
    } else if (FrogUtils.checkMatchArray(STATUS_STARTED, line) == true) {
      this.setGameStatus("started");
    } else if (FrogUtils.checkMatchArray(STATUS_STOPPING, line) == true) {
      this.setGameStatus("stopping");
    }
  }

  static prepareUIToStart(prepare = true) {
    if (prepare == true) {
      FrogUI.changeBottomControlsStatus(false, true, true);
      FrogUI.showDownloadManager(true);
    } else {
      FrogUI.changeBottomControlsStatus(true, false, false);
      FrogUI.showDownloadManager(false);
    }
  }

  static setGameStatus(newStatus) {
    var oldStatus = gameStatus;
    if (oldStatus != newStatus) {
      gameStatus = newStatus;
      this.onStatusChange(newStatus, true);
    } else {
      this.onStatusChange(newStatus, false);
    }
  }

  static onStatusChange(newStatus, changed) {
    if (changed == true && newStatus == "stopped") {
      // Status changed to `stopped`
      if (mainConfig.disappearOnStart == true) {
        FrogBackendCommunicator.appearMainWindow();
      }
      this.prepareUIToStart(false);
      if (mainConfig.enableDiscordPresence == true) {
        FrogDiscordPresence.setPresenceMode("menu");
      }
      this.deleteTemporaryMods();
    } else if (changed == true && newStatus == "starting") {
      // Status changed to `starting`
      if (mainConfig.disappearOnStart == true) {
        FrogBackendCommunicator.disappearMainWindow();
      }
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameInfo) => {
          FrogDiscordPresence.setPresenceMode(
            "loading",
            gameInfo.version,
            gameInfo.type
          );
        }
      );
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Запускаем игру, подождите"
      );
      FrogUI.showDownloadManager(false);
    } else if (changed == true && newStatus == "started") {
      // Status changed to `started`
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameInfo) => {
          FrogDiscordPresence.setPresenceMode(
            "playing",
            gameInfo.version,
            gameInfo.type
          );
        }
      );
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Игра запущена успешно!"
      );
      FrogUI.showDownloadManager(false);
    } else if (changed == true && newStatus == "stopping") {
      // Status changed to `stopping`
      FrogUI.changeBottomControlsStatus(
        false,
        false,
        true,
        "Игра закрывается..."
      );
    }
  }

  static startSelectedVersion() {
    if (selectedAccount != null && selectedGameVersion != null) {
      gameStatus = "stopped";
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (versionInfo) => {
          if (versionInfo != false) {
            switch (versionInfo.type) {
              case "vanilla":
                // Starting vanilla version
                this.startVanilla(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G",
                  "release"
                ); // TODO: Snapshots/betas/etc. support
                break;
              case "forge":
                this.startForge(
                  versionInfo.version,
                  versionInfo.url,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "forgeoptifine":
                this.startForgeOptiFine(
                  versionInfo.version,
                  versionInfo.forgeUrl,
                  versionInfo.ofUrl,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "fabric":
                this.startFabric(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "fabricsodiumiris":
                this.startFabricSodium(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
            }
          } else {
            Toaster(
              "Произошла ошибка запуска версии, обратитесь к разработчику<br><span class='mc-text'>GVBSN_RET_FALSE</span>",
              5000,
              false,
              "warning"
            );
          }
        }
      );
    }
  }

  static getFinalJavaPath(version, cb) {
    if (mainConfig.selectedJava == "auto") {
      FrogDownloadManager.getJavaAutodetectPath(version, (autoJavaPath) => {
        if (autoJavaPath == false) {
          Toaster(
            "Ошибка при автоматическом выборе версии Java!",
            3500,
            false,
            "error"
          );
          cb(false);
          return;
        }
        cb(autoJavaPath);
      });
    } else {
      cb(mainConfig.selectedJava);
    }
  }

  // Delete all temporary files from `mods` (this file is stored in `cache` directory)
  static deleteTemporaryMods() {
    var removed = [];
    var rdir = fs.readdirSync(
      path.join(mainConfig.selectedBaseDirectory, "mods")
    );
    rdir.forEach(function (dr) {
      if (dr.match(/OptiFine_1.*\.jar/gim) != null && !removed.includes(dr)) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
        removed.push(dr);
      }
      if (dr.match(/fabric-0.*\.jar/gim) != null && !removed.includes(dr)) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
        removed.push(dr);
      }
      if (dr.match(/fabric-api-0.*\.jar/gim) != null && !removed.includes(dr)) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
        removed.push(dr);
      }
      if (dr.match(/sodium-fabric-.*\.jar/gim) != null && !removed.includes(dr)) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
        removed.push(dr);
      }
      if (dr.match(/iris-.*\.jar/gim) != null && !removed.includes(dr)) {
        fs.unlinkSync(path.join(mainConfig.selectedBaseDirectory, "mods", dr));
        removed.push(dr);
      }
    });
    return true;
  }
}
