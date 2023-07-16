class FrogVanillaStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogGeneralStarter.launchGeneral(this.options, "Vanilla");
  }
}
