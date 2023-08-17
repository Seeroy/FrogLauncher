class Frog3rdCompiler {
  // Function for generating 3rd start args
  static compile3rdArguments(
    rootDirectory,
    versionDirectory,
    authData,
    maxMemory,
    javaPath = "java.exe"
  ) {
    var launch_arguments = {
      authorization: authData,
      root: rootDirectory,
      cache: path.join(rootDirectory, "cache"),
      version: {
        number: FrogVersionsManager.detectMinecraftVersion(versionDirectory)[0],
        type: "release",
        custom: versionDirectory,
      },
      javaPath: javaPath,
      memory: {
        max: maxMemory,
        min: "1G",
      },
      overrides: {
        gameDirectory: rootDirectory,
        maxSockets: 2,
      },
    };
    return launch_arguments;
  }

  // Vanilla start process
  static start3rdParty(versionInfo, memory) {
    FrogStartManager.prepareUIToStart(true);
    var startArguments, rdStarter;
    FrogAccountManager.generateAuthCredetinals(selectedAccount, (authData) => {
      FrogStartManager.getFinalJavaPath(FrogVersionsManager.detectMinecraftVersion(versionInfo.shortName)[0], (finalJP) => {
        startArguments = this.compile3rdArguments(
          mainConfig.selectedBaseDirectory,
          versionInfo.shortName.replace(/3rdparty\-/gi, ""),
          authData,
          memory,
          finalJP
        );
        rdStarter = new Frog3rdStarter(startArguments);
        rdStarter.launch();
      });
    });
  }
}
