const VERSIONS_MANIFEST_URL =
  "https://piston-meta.mojang.com/mc/game/version_manifest.json";
const FORGE_LIST_URL = "https://api.curseforge.com/v1/minecraft/modloader";
const SODIUM_LIST_URL = "https://api.modrinth.com/v2/project/sodium/version";
const FABRIC_API_LIST_URL =
  "https://api.modrinth.com/v2/project/fabric-api/version";
const MODLOADERS_INFO_URL = "http://seeroycloud.tk/froglauncher/data.json";
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
    old_beta = false,
    old_alpha = false
  ) {
    $.get(VERSIONS_MANIFEST_URL, function (data) {
      var versions = [];
      data = data.versions;
      data.forEach((element) => {
        if (
          (element.type == "release" && releases == true) ||
          (element.type == "snapshot" && snapshots == true) ||
          (element.type == "old_beta" && old_beta == true) ||
          (element.type == "old_alpha" && old_alpha == true)
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

  static getSodiumReleases(cb) {
    var sversions = {};
    $.get(SODIUM_LIST_URL, function (data) {
      data.forEach((element) => {
        element.game_versions.forEach((version) => {
          sversions[version] = element.files[0].url;
        });
      });
      cb(sversions);
    });
  }

  static getFabricInstaller() {
    return modloadersMyInfo.fabric.latestInstaller;
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
    return modloadersMyInfo.fabric.supportedVersions;
  }

  static getAllVersionsList(cb) {
    var releases = [];
    var installedVersions = this.getInstalledVersionsList();
    this.getVanillaReleases((vanilla_releases) => {
      vanilla_releases.forEach((vanilla_release) => {
        var vversionItem = {
          shortName: "vanilla-" + vanilla_release.version,
          version: vanilla_release.version,
          type: "vanilla",
          installed: installedVersions.includes(vanilla_release.version),
        };
        releases.push(vversionItem);
      });
      this.getForgeReleases((forge_releases) => {
        for (const [key, value] of Object.entries(forge_releases)) {
          var fversionItem = {
            shortName: "forge-" + key,
            version: key,
            url: value,
            type: "forge",
            installed: installedVersions.includes("Forge " + key),
          };
          releases.push(fversionItem);
        }
        for (const [key2, value2] of Object.entries(
          modloadersMyInfo.optifine
        )) {
          if (
            typeof forge_releases[key2] !== "undefined" &&
            forge_releases[key2] != null
          ) {
            var foversionItem = {
              shortName: "forgeoptifine-" + key2,
              version: key2,
              forgeUrl: forge_releases[key2],
              ofUrl: value2,
              type: "forgeoptifine",
              installed: installedVersions.includes("Forge " + key2),
            };
            releases.push(foversionItem);
          }
        }
        var fabric_versions = this.getFabricAvailableVersions();
        fabric_versions.forEach((fabric_version) => {
          var fbversionItem = {
            shortName: "fabric-" + fabric_version,
            version: fabric_version,
            type: "fabric",
            installed: installedVersions.includes("Fabric " + fabric_version.version)
          };
          releases.push(fbversionItem);
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
          let i = 0;
          let result = 0;
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
    });
  }

  static generateVersionDisplayname(version) {
    switch (version.type) {
      case "vanilla":
        return "Версия " + version.version;
      case "forge":
        return "Версия Forge " + version.version;
      case "forgeoptifine":
        return "Версия ForgeOptiFine " + version.version;
      case "fabric":
        return "Версия Fabric " + version.version;
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
            directories.push(
              "Fabric " + fabParse["version"]
            );
          } else {
            directories.push(item);
          }
        }
        var chkRegex = new RegExp(
          "forge-" + item.replaceAll(/\./gim, "\\.") + ".*",
          "gim"
        );
        var rdir = fs.readdirSync(
          path.join(mainConfig.selectedBaseDirectory, "cache")
        );
        rdir.forEach(function (dr) {
          if (dr.match(chkRegex) != null) {
            directories.push("Forge " + item);
          }
        });
      });
      return directories;
    } else {
      return [];
    }
  }

  static getVersionByShortName(shortName, cb) {
    var installedVersions = this.getInstalledVersionsList();
    var versionType = shortName.split("-")[0];
    var version = shortName.split("-")[1];
    var retValue = false;
    switch (versionType) {
      case "vanilla":
        this.getVanillaReleases((vanilla_releases) => {
          vanilla_releases.forEach((vanilla_release) => {
            if (vanilla_release.version == version) {
              retValue = {
                shortName: "vanilla-" + vanilla_release.version,
                version: vanilla_release.version,
                url: vanilla_release.manifestURL,
                type: "vanilla",
                installed: installedVersions.includes(vanilla_release.version),
              };
            }
          });
          cb(retValue);
        });
        break;
      case "forge":
        this.getForgeReleases((forge_releases) => {
          for (const [key, value] of Object.entries(forge_releases)) {
            if (key == version) {
              retValue = {
                shortName: "forge-" + key,
                version: key,
                url: value,
                type: "forge",
                installed: installedVersions.includes("Forge " + key),
              };
            }
          }
          cb(retValue);
        });
        break;
      case "forgeoptifine":
        var fres = false;
        var ofres = false;
        this.getForgeReleases((forge_releases) => {
          for (const [key, value] of Object.entries(forge_releases)) {
            if (key == version) {
              fres = value;
              for (const [key2, value2] of Object.entries(
                modloadersMyInfo.optifine
              )) {
                if (key2 == version) {
                  ofres = value2;
                }
              }
            }
          }
          if (fres != false && ofres != false) {
            cb({
              shortName: "forgeoptifine-" + version,
              version: version,
              forgeUrl: fres,
              ofUrl: ofres,
              type: "forgeoptifine",
              installed: installedVersions.includes("Forge " + version),
            });
          } else {
            cb(false);
          }
        });
        break;
      case "fabric":
        var fabric_versions = this.getFabricAvailableVersions();
        fabric_versions.forEach((fabric_version) => {
          if (fabric_version == version) {
            retValue = {
              shortName: "fabric-" + fabric_version,
              version: fabric_version,
              type: "fabric",
            };
          }
        });
        cb(retValue);
        break;
    }
  }

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

  static isFabricDirectoryMatches(directory, version) {
    var flsp = this.fabricLoaderStringParse(directory);
    return flsp.version == version;
  }
}
