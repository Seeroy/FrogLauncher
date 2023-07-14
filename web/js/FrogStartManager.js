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
        gameDirectory: rootDirectory
      }
    };
    return launch_arguments;
  }

  
}