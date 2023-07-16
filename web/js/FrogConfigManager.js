class FrogConfigManager {
  static readMainConfig() {
    if (fs.existsSync("config.json")) {
      return JSON.parse(fs.readFileSync("config.json"));
    } else {
      return false;
    }
  }

  static writeMainConfig(config) {
    fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
    FrogBackendCommunicator.logBrowserConsole(
      "[CONFMAN]",
      "Main config saved successfully"
    );
    return true;
  }

  static writeAndRefreshMainConfig(config) {
    mainConfig = config;
    this.writeMainConfig(config);
  }

  static writeDefaultMainConfig() {
    FrogBackendCommunicator.logBrowserConsole(
      "[CONFMAN]",
      "Main config will be rewritten to default"
    );
    var defaultCfg = {
      selectedMemorySize: (FrogInfo.getMaxRAMSize() / 1024).toFixed(1) / 2,
      selectedJava: "auto",
      selectedBaseDirectory: FrogInfo.getDefaultDotMinecraft(),
      selectedTheme: "indigo",
      selectedBackground: 1,
      selectedBaseFont: "default",
      lastSelectedAccount: "none",
      lastSelectedVersion: "none",
      openConsoleOnStart: false,
      enableDownloadManager: true,
      enableDiscordPresence: true,
      launcherStoryViewed: false,
      eulaAccepted: false,
      oobeFinished: false
    };
    this.writeMainConfig(defaultCfg);
    return defaultCfg;
  }
}
