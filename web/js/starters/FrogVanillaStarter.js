class FrogVanillaStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogBackendCommunicator.logBrowserConsole(
      "[S]",
      "Trying to start Vanilla Minecraft",
      this.options.version.number
    );
    launcher.launch(this.options);
    launcher.on("debug", (e) => FrogBackendCommunicator.logBrowserConsole(e));
    launcher.on("data", (e) => FrogBackendCommunicator.logBrowserConsole(e));
  }
}