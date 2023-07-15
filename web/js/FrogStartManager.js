const STATUS_STARTING = [/Setting user\:/gim, /Launching wrapped minecraft/gim];
const STATUS_STARTED = [/OpenAL initialized/gim, /Sound engine started/gim];
const STATUS_STOPPING = [
  /Stopping!/gim,
  /Author\: Paul Lamb/gim,
  /SoundSystem shutting down\.\.\./gim,
];

class FrogStartManager {
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

  static startVanilla(version, memory, type = "release") {
    this.prepareUIToStart(true);
    var startArguments, vanillaStarter;
    var authData = FrogAccountManager.generateAuthCredetinals(selectedAccount);
    FrogUI.changeBottomControlsStatus(false, true, true);
    if (mainConfig.selectedJava == "auto") {
      FrogDownloadManager.getJavaAutodetectPath(version, (autoJavaPath) => {
        if(autoJavaPath == false){
          Toaster("Ошибка при автоматическом выборе версии Java!", 3500, false, "error");
          return;
        }
        startArguments = this.compileVanillaArguments(
          mainConfig.selectedBaseDirectory,
          version,
          authData,
          memory,
          autoJavaPath,
          type
        );
        vanillaStarter = new FrogVanillaStarter(startArguments);
        vanillaStarter.launch();
      });
    } else {
      startArguments = this.compileVanillaArguments(
        mainConfig.selectedBaseDirectory,
        version,
        authData,
        memory,
        mainConfig.selectedJava,
        type
      );
      vanillaStarter = new FrogVanillaStarter(startArguments);
      vanillaStarter.launch();
    }
  }

  static parseStartStatus(line) {
    // Handle game starting event with regex
    if (gameStatus != "starting") {
      STATUS_STARTING.forEach(function (status) {
        if (line.match(status) != null) {
          gameStatus = "starting";
          FrogUI.changeBottomControlsStatus(
            false,
            false,
            true,
            "Запускаем игру, подождите"
          );
          FrogUI.showDownloadManager(false);
        }
      });
    }
    // Handle game started event with regex
    if (gameStatus != "started") {
      STATUS_STARTED.forEach(function (status) {
        if (line.match(status) != null) {
          gameStatus = "started";
          FrogUI.changeBottomControlsStatus(
            false,
            false,
            true,
            "Игра запущена успешно!"
          );
          FrogUI.showDownloadManager(false);
        }
      });
    }
    // Handle game stopping event with regex
    if (gameStatus != "stopping") {
      STATUS_STOPPING.forEach(function (status) {
        if (line.match(status) != null) {
          gameStatus = "stopping";
          FrogUI.changeBottomControlsStatus(
            false,
            false,
            true,
            "Игра закрывается..."
          );
        }
      });
    }
    // Handle game closed event with regex
    if (gameStatus != "stopped" && line == "mclc-close-evt") {
      gameStatus = "stopped";
      this.prepareUIToStart(false);
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

  static startSelectedVersion() {
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
