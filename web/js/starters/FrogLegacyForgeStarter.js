class FrogLegacyForgeStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogGeneralStarter.launchGeneral(this.options, "Forge");
  }
}
