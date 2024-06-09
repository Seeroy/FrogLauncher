const VERSIONS_MANIFEST_URL =
  "https://piston-meta.mojang.com/mc/game/version_manifest.json";
const FORGE_LIST_URL = "https://api.curseforge.com/v1/minecraft/modloader";
const SODIUM_LIST_URL = "https://api.modrinth.com/v2/project/sodium/version";
const IRIS_LIST_URL = "https://api.modrinth.com/v2/project/iris/version";
const FABRIC_API_LIST_URL =
  "https://api.modrinth.com/v2/project/fabric-api/version";
const MODLOADERS_INFO_URL = "http://froglauncher.seeeroy.ru/datav2.json";
var modloadersMyInfo;

class FrogVersionsManager {
  static refreshMyModloadersInfo(cb) {
    $.get(MODLOADERS_INFO_URL, (res) => {
      modloadersMyInfo = res;
      cb();
    });
  }

  static getVanillaReleases(
    cb,
    releases = true,
    snapshots = false,
    others = false
  ) {
    $.get(VERSIONS_MANIFEST_URL, function (data) {
      var versions = [];
      data = data.versions;
      data.forEach((element) => {
        if (
          (element.type == "release" && releases == true) ||
          (element.type == "snapshot" && snapshots == true) ||
          others == true
        ) {
          var versionItem = {
            version: element.id,
            type: element.type,
            manifestURL: element.url,
          };
          versions.push(versionItem);
        }
      });
      cb(versions);
    });
  }

  static getForgeReleases(cb) {
    var fversions = {};
    Object.entries(modloadersMyInfo.forge).forEach((entry) => {
      const [key, value] = entry;
      fversions[key] = value;
    });
    cb(fversions);
  }

  static getLegacyForgeReleases(cb) {
    var fversions = {};
    Object.entries(modloadersMyInfo.forgeLegacy).forEach((entry) => {
      const [key, value] = entry;
      fversions[key] = value;
    });
    cb(fversions);
  }

  static getSodiumReleases(cb) {
    var sversions = {};
    $.get(SODIUM_LIST_URL, function (data) {
      data.forEach((element) => {
        element.game_versions.forEach((version) => {
          if (typeof sversions[version] === "undefined") {
            sversions[version] = element.files[0].url;
          }
        });
      });
      cb(sversions);
    });
  }

  static getIrisReleases(cb) {
    var sversions = {};
    $.get(IRIS_LIST_URL, function (data) {
      data.forEach((element) => {
        element.game_versions.forEach((version) => {
          if (typeof sversions[version] === "undefined") {
            sversions[version] = element.files[0].url;
          }
        });
      });
      cb(sversions);
    });
  }

  static getFabricAPIReleases(cb) {
    var sversions = {};
    $.get(FABRIC_API_LIST_URL, function (data) {
      data.forEach((element) => {
        element.game_versions.forEach((version) => {
          sversions[version] = element.files[0].url;
        });
      });
      cb(sversions);
    });
  }

  static getFabricAvailableVersions() {
    var suppVers = [];
    for (const [key, value] of Object.entries(
      modloadersMyInfo.fabric.versions
    )) {
      suppVers.push(key);
    }
    return suppVers;
  }

  static getQuiltAvailableVersions() {
    var suppVers = [];
    for (const [key, value] of Object.entries(
      modloadersMyInfo.quilt.versions
    )) {
      suppVers.push(key);
    }
    return suppVers;
  }

  static getAllVersionsList(cb) {
    var releases = [];
    installedVersionsChk = this.getInstalledVersionsList();
    this.getVanillaReleases(
      (vanilla_releases) => {
        vanilla_releases.forEach((vanilla_release) => {
          releases.push(
            FrogVanillaCompiler.compileDataFromRaw(
              installedVersionsChk,
              vanilla_release
            )
          );
        });
        this.getForgeReleases((forge_releases) => {
          for (const [key, value] of Object.entries(forge_releases)) {
            releases.push(
              FrogForgeCompiler.compileDataFromRaw(
                installedVersionsChk,
                key,
                "forge",
                value
              )
            );
          }
          for (const [key2, value2] of Object.entries(
            modloadersMyInfo.optifine
          )) {
            if (
              typeof forge_releases[key2] !== "undefined" &&
              forge_releases[key2] != null
            ) {
              releases.push(
                FrogForgeCompiler.compileDataFromRaw(
                  installedVersionsChk,
                  key2,
                  "forgeoptifine",
                  forge_releases[key2],
                  value2
                )
              );
            }
          }
          var fabric_versions = this.getFabricAvailableVersions();
          fabric_versions.forEach((fabric_version) => {
            releases.push(
              FrogFabricCompiler.compileDataFromRaw(
                installedVersionsChk,
                fabric_version,
                "fabric",
                "Fabric"
              )
            );
            releases.push(
              FrogFabricCompiler.compileDataFromRaw(
                installedVersionsChk,
                fabric_version,
                "fabricsodiumiris",
                "FabricSodiumIris"
              )
            );
          });
          var quilt_versions = this.getQuiltAvailableVersions();
          quilt_versions.forEach((quilt_version) => {
            releases.push(
              FrogFabricCompiler.compileDataFromRaw(
                installedVersionsChk,
                quilt_version,
                "quilt",
                "Quilt"
              )
            );
          });
          this.getLegacyForgeReleases((leg_forge_releases) => {
            for (const [key, value] of Object.entries(leg_forge_releases)) {
              releases.push(
                FrogLegacyForgeCompiler.compileDataFromRaw(
                  installedVersionsChk,
                  key,
                  "legacyforge",
                  value
                )
              );
            }
            for (const [key2, value2] of Object.entries(
              modloadersMyInfo.optifine
            )) {
              if (
                typeof leg_forge_releases[key2] !== "undefined" &&
                leg_forge_releases[key2] != null
              ) {
                releases.push(
                  FrogLegacyForgeCompiler.compileDataFromRaw(
                    installedVersionsChk,
                    key2,
                    "legacyforgeoptifine",
                    leg_forge_releases[key2],
                    value2
                  )
                );
              }
            }
          });
          installedVersionsChk.forEach((version) => {
            var detectVer = this.detectMinecraftVersion(version);
            if(detectVer != null){
              detectVer = detectVer[0];
            } else {
              detectVer = "";
            }
            releases.push({
              shortName: "3rdparty-" + version,
              version: detectVer,
              type: "3rdparty",
              installed: true,
            });
          });
          releases.sort(function (a, b) {
            // MinecraftVersionSorter by TheRolf
            // https://gist.github.com/TheRolfFR/7e193d30c2a21e19bbebecf4f5fcbd1b
            const aSplit = a.version.split(".").map((s) => parseInt(s));
            const bSplit = b.version.split(".").map((s) => parseInt(s));

            if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
              return String(a).localeCompare(String(b)); // compare as strings
            }

            const upper = Math.min(aSplit.length, bSplit.length);
            var i = 0;
            var result = 0;
            while (i < upper && result == 0) {
              result =
                aSplit[i] == bSplit[i] ? 0 : aSplit[i] < bSplit[i] ? -1 : 1; // each number
              ++i;
            }

            if (result != 0) return result;

            result =
              aSplit.length == bSplit.length
                ? 0
                : aSplit.length < bSplit.length
                ? -1
                : 1; // longer length wins

            return result;
          });
          releases.reverse();
          gameVersions = releases;
          cb(releases);
        });
      },
      true,
      true,
      true
    );
  }

  static generateVersionDisplayname(version) {
    switch (version.type) {
      case "vanilla":
        return "Версия " + version.version;
      case "forge":
        return "Версия Forge " + version.version;
      case "legacyforge":
        return "Версия Forge " + version.version;
      case "legacyforgeoptifine":
        return "Версия ForgeOptiFine " + version.version;
      case "forgeoptifine":
        return "Версия ForgeOptiFine " + version.version;
      case "fabric":
        return "Версия Fabric " + version.version;
      case "quilt":
        return "Версия Quilt " + version.version;
      case "fabricsodiumiris":
        return "Версия FabricSodiumIris " + version.version;
      case "3rdparty":
        return (
          "Версия " + version.shortName.toString().replace(/3rdparty\-/gim, "")
        );
    }
  }

  static getInstalledVersionsList() {
    var versPath = path.join(mainConfig.selectedBaseDirectory, "versions");
    if (fs.existsSync(versPath)) {
      var directories = [];
      var rddrs = fs.readdirSync(versPath);
      rddrs.forEach(function (item) {
        if (fs.lstatSync(path.join(versPath, item)).isDirectory()) {
          var fabParse = FrogVersionsManager.fabricLoaderStringParse(item);
          if (fabParse != false) {
            directories.push("Fabric " + fabParse["version"]);
            directories.push("FabricSodiumIris " + fabParse["version"]);
          } else {
            directories.push(item);
          }
          var quiParse = FrogVersionsManager.quiltLoaderStringParse(item);
          if (quiParse != false) {
            directories.push("Quilt " + quiParse["version"]);
          } else {
            directories.push(item);
          }
          if (
            item.match(/Forge1.*/gm) != null &&
            !FrogVersionsManager.isModernForgeVersion(item.split("e")[1])
          ) {
            directories.push("ForgeLegacy " + item.split("e")[1]);
            if (
              typeof modloadersMyInfo.optifine[item.split("e")[1]] !==
                "undefined" &&
              fs.existsSync(
                path.join(
                  mainConfig.selectedBaseDirectory,
                  "cache",
                  FrogUtils.getFilenameFromURL(
                    modloadersMyInfo.optifine[item.split("e")[1]]
                  )
                )
              )
            ) {
              directories.push("ForgeOptiFineLegacy " + item.split("e")[1]);
            }
          } else {
            var chkRegex = new RegExp(
              "forge-" + item.replaceAll(/\./gim, "\\.") + ".*",
              "gim"
            );
            var cachePath = path.join(
              mainConfig.selectedBaseDirectory,
              "cache"
            );
            if (fs.existsSync(cachePath)) {
              var rdir = fs.readdirSync(
                path.join(mainConfig.selectedBaseDirectory, "cache")
              );
              rdir.forEach(function (dr) {
                if (dr.match(chkRegex) != null) {
                  directories.push("Forge " + item);
                }
              });
            } else {
              var rdir = [];
            }
          }
        }
      });
      var newArray = directories.filter(
        (value, index, self) => self.indexOf(value) === index
      );
      return newArray;
    } else {
      return [];
    }
  }

  static getVersionByShortName(shortName, cb) {
    var versionType = shortName.split("-")[0];
    var version = shortName.split("-")[1];
    switch (versionType) {
      case "vanilla":
        FrogVanillaCompiler.getDataByVersion(version, cb);
        break;
      case "forge":
        FrogForgeCompiler.getFDataByVersion(version, cb);
        break;
      case "forgeoptifine":
        FrogForgeCompiler.getFODataByVersion(version, cb);
        break;
      case "legacyforge":
        FrogLegacyForgeCompiler.getFDataByVersion(version, cb);
        break;
      case "legacyforgeoptifine":
        FrogLegacyForgeCompiler.getFODataByVersion(version, cb);
        break;
      case "fabric":
        FrogFabricCompiler.getFabDataByVersion(version, cb);
        break;
      case "quilt":
        FrogFabricCompiler.getQuiltDataByVersion(version, cb);
        break;
      case "fabricsodiumiris":
        FrogFabricCompiler.getFabSodDataByVersion(version, cb);
        break;
      case "3rdparty":
        cb({
          type: shortName.split("-")[0],
          shortName: shortName
        })
    }
  }

  // Fabric management functions
  static fabricLoaderStringParse(name) {
    if (name.match(/fabric\-loader/gim) != null) {
      return {
        name: "Fabric",
        version: name.split("-").slice(-1),
      };
    } else {
      return false;
    }
  }

  static quiltLoaderStringParse(name) {
    if (name.match(/quilt\-loader/gim) != null) {
      return {
        name: "Quilt",
        version: name.split("-").slice(-1),
      };
    } else {
      return false;
    }
  }

  static isFabricDirectoryMatches(directory, version) {
    var flsp = this.fabricLoaderStringParse(directory);
    return flsp.version == version;
  }

  static getFabricDirectoryByVersion(version) {
    var rdir = fs.readdirSync(
      path.join(mainConfig.selectedBaseDirectory, "versions")
    );
    var dirName = false;
    var fabRegex = new RegExp(
      "fabric-loader.*" + version.replaceAll(/\./gim, "\\.") + ".*",
      "gim"
    );
    rdir.forEach((element) => {
      if (element.match(fabRegex) != null) {
        dirName = {
          directoryName: element,
          fullDirectoryPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element
          ),
          jarName: element + ".jar",
          fullJarPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element,
            element + ".jar"
          ),
          versionJsonName: element + ".json",
          fullVersionJsonPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element,
            element + ".json"
          ),
        };
      }
    });
    return dirName;
  }

  static getQuiltDirectoryByVersion(version) {
    var rdir = fs.readdirSync(
      path.join(mainConfig.selectedBaseDirectory, "versions")
    );
    var dirName = false;
    var quiRegex = new RegExp(
      "quilt-loader.*" + version.replaceAll(/\./gim, "\\.") + ".*",
      "gim"
    );
    rdir.forEach((element) => {
      if (element.match(quiRegex) != null) {
        dirName = {
          directoryName: element,
          fullDirectoryPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element
          ),
          jarName: element + ".jar",
          fullJarPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element,
            element + ".jar"
          ),
          versionJsonName: element + ".json",
          fullVersionJsonPath: path.join(
            mainConfig.selectedBaseDirectory,
            "versions",
            element,
            element + ".json"
          ),
        };
      }
    });
    return dirName;
  }

  // Forge management functions
  static isModernForgeVersion(version) {
    var sec = version.split(".")[1];
    return sec > 12 ? true : false;
  }

  static detectMinecraftVersion(name) {
    return name.match(/1\.\d{1,2}(\.\d{1,2})?/gim);
  }
}
