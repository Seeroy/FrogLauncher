class FrogQuiltStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogGeneralStarter.launchGeneral(this.options, "Quilt");
  }
}
