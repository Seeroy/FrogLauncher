const STATUS_STARTING = [
  /Setting user\:/gim,
  /Launching wrapped minecraft/gim,
  /ModLauncher running/gim,
  /Launching target \'fmlclient\'/gim,
  /Loading tweak class/gim,
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

  static parseStartStatus(line) {
    if (line == "mclc-close-evt") {
      this.setGameStatus("stopped");
    } else if (
      FrogUtils.checkMatchArray(STATUS_STARTING, line) == true ||
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
      this.prepareUIToStart(false);
      if (mainConfig.enableDiscordPresence == true) {
        FrogDiscordPresence.setPresenceMode("menu");
      }
    } else if (changed == true && newStatus == "starting") {
      // Status changed to `starting`
      FrogVersionsManager.getVersionByShortName(
        selectedGameVersion,
        (gameInfo) => {
          FrogDiscordPresence.setPresenceMode(
            "loading",
            gameInfo.version,
            FrogUtils.capitalizeWord(gameInfo.type)
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
            FrogUtils.capitalizeWord(gameInfo.type)
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
            case "forge":
              this.startForge(
                versionInfo.version,
                versionInfo.url,
                mainConfig.selectedMemorySize + "G"
              );
            case "forgeoptifine":
              this.startForgeOptiFine(
                versionInfo.version,
                versionInfo.forgeUrl,
                versionInfo.ofUrl,
                mainConfig.selectedMemorySize + "G"
              );
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
}
