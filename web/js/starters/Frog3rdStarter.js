class Frog3rdStarter {
  constructor(opts) {
    this.options = opts;
  }

  launch() {
    FrogGeneralStarter.launchGeneral(this.options, "MC");
  }
}
