class FrogDiscordPresence {
  static setPresenceMode(mode, gameVersion = "", gameType = "") {
    if (mainConfig.enableDiscordPresence == true) {
      switch (mode) {
        case "menu":
          ipcRenderer.send("set-discord-rpc", {
            details: "В меню лаунчера",
            timestamps: {
              start: Date.now(),
            },
            assets: {
              large_image: "icon1024",
              large_text: "FrogLauncher",
            },
            buttons: [
              {
                label: "Я тоже такой хочу",
                url: "https://github.com/seeroy/FrogLauncher",
              },
            ],
          });
          break;
        case "loading":
          ipcRenderer.send("set-discord-rpc", {
            details: "Запускает Minecraft",
            state: gameType + " " + gameVersion,
            assets: {
              large_image: "icon1024",
              large_text: "FrogLauncher",
            },
            buttons: [
              {
                label: "Я тоже такой хочу",
                url: "https://github.com/seeroy/FrogLauncher",
              },
            ],
          });
          break;
        case "playing":
          ipcRenderer.send("set-discord-rpc", {
            details: "Играет в Minecraft",
            state: gameType + " " + gameVersion,
            timestamps: {
              start: Date.now(),
            },
            assets: {
              large_image: "icon1024",
              large_text: "FrogLauncher",
            },
            buttons: [
              {
                label: "Я тоже такой хочу",
                url: "https://github.com/seeroy/FrogLauncher",
              },
            ],
          });
          break;
      }
    }
  }

  static stopPresence() {
    ipcRenderer.send("stop-discord-rpc");
  }
}