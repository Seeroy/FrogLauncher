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

  static testStart(accountName) {
    var accountData = FrogAccountManager.getAccountByName(accountName);
    var authData = FrogAccountManager.generateAuthCredetinals(accountData);
    var startArguments = this.compileVanillaArguments(
      mainConfig.selectedBaseDirectory,
      "1.12.2",
      authData,
      "4G"
    );
    var vanillaStarter = new FrogVanillaStarter(startArguments);
    vanillaStarter.launch();
  }
}
