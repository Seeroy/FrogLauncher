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

        $(".blackscreen").removeClass("hidden");
        setTimeout(function () {
          animateCSS(".blackscreen", "fadeOut", true).then(() => {
            $(".blackscreen").addClass("hidden");
          });
          FrogUI.refreshAbsoluteElementsPositions();
        }, 450);
        if (mainConfig.selectedBackground.toString().length > 2) {
          // Nothing
        } else if (mainConfig.selectedBackground > 0) {
          // Nothing
        } else {
          FrogAnimatedBackgrounds.startAnimationByName(
            mainConfig.selectedBackground
          );
        }

        FrogBackendCommunicator.appearMainWindow();
        FrogVersionsUI.refreshVersionsListModal(
          lastVersionsFilters,
          lastVanillaShowType
        );
      }
      this.prepareUIToStart(false);
      if (mainConfig.enableDiscordPresence == true) {
        FrogDiscordPresence.setPresenceMode("menu");
      }
      this.deleteTemporaryMods();

    } else if (changed == true && newStatus == "starting") {
      // Status changed to `starting`
      if (mainConfig.disappearOnStart == true) {

        if (mainConfig.selectedBackground.toString().length > 2) {
          // Nothing
        } else if (mainConfig.selectedBackground > 0) {
          // Nothing
        } else {
          FrogAnimatedBackgrounds.stopBackground();
        }
        
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
                FrogVanillaCompiler.startVanilla(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G",
                  versionInfo.releaseType
                );
                break;
              case "forge":
                FrogForgeCompiler.startForge(
                  versionInfo.version,
                  versionInfo.url,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "forgeoptifine":
                FrogForgeCompiler.startForgeOptiFine(
                  versionInfo.version,
                  versionInfo.forgeUrl,
                  versionInfo.ofUrl,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "legacyforge":
                FrogLegacyForgeCompiler.startForge(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "legacyforgeoptifine":
                FrogLegacyForgeCompiler.startForgeOptiFine(
                  versionInfo.version,
                  versionInfo.ofUrl,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "fabric":
                FrogFabricCompiler.startFabric(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "quilt":
                FrogFabricCompiler.startQuilt(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "fabricsodiumiris":
                FrogFabricCompiler.startFabricSodium(
                  versionInfo.version,
                  mainConfig.selectedMemorySize + "G"
                );
                break;
              case "3rdparty":
                Frog3rdCompiler.start3rdParty(
                  versionInfo,
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
      if (
        dr.match(/sodium-fabric-.*\.jar/gim) != null &&
        !removed.includes(dr)
      ) {
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
