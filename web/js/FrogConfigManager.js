class FrogConfigManager {
  static readMainConfig() {
    if (fs.existsSync("config.json")) {
      return JSON.parse(fs.readFileSync("config.json"));
    } else {
      return false;
    }
  }

  static writeMainConfig(config) {
    if (fs.existsSync("config.json")) {
      fs.writeFileSync("config.json", JSON.stringify(config));
      FrogBackendCommunicator.logBrowserConsole("[CONFMAN]", "Main config saved successfully");
      return true;
    } else {
      FrogBackendCommunicator.logBrowserConsole("[CONFMAN]", "Main config not saved: File not exists");
      return false;
    }
  }

  static writeAndRefreshMainConfig(config) {
    mainConfig = config;
    this.writeMainConfig(config);
  }

  static writeDefaultMainConfig() {
    var defaultCfg = {
      selectedMemorySize: (FrogInfo.getMaxRAMSize() / 1024).toFixed(1) / 2,
      selectedJava: "auto",
      selectedBaseDirectory: FrogInfo.getDefaultDotMinecraft(),
      selectedTheme: 'indigo',
      selectedBaseFont: "default",
      lastSelectedAccount: "none",
      lastSelectedVersion: "none"
    };
    fs.writeFileSync("config.json", JSON.stringify(defaultCfg));
    FrogBackendCommunicator.logBrowserConsole("[CONFMAN]", "Main config rewritten to default");
    return defaultCfg;
  }
}
