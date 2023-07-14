const VERSIONS_MANIFEST_URL =
  "https://piston-meta.mojang.com/mc/game/version_manifest.json";
const FORGE_LIST_URL = "https://api.curseforge.com/v1/minecraft/modloader";
const SODIUM_LIST_URL = "https://api.modrinth.com/v2/project/sodium/version";
const FABRIC_LATEST_INSTALLER = "https://seeroycloud.tk/latest_fabric_url.txt";
const FABRIC_VERSIONS_LIST = "https://seeroycloud.tk/fabric_versions.json";
const FABRIC_API_LIST_URL =
  "https://api.modrinth.com/v2/project/fabric-api/version";

class FrogVersionsManager {
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
    $.get(FORGE_LIST_URL, function (data) {
      data = data.data;
      data.forEach((element) => {
        if (element.recommended == true) {
          fversions[element.gameVersion] = element.name;
        }
      });
      cb(fversions);
    });
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

  static getFabricInstaller(cb) {
    $.get(FABRIC_LATEST_INSTALLER, cb);
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

  static getFabricAvailableVersions(cb) {
    $.get(FABRIC_VERSIONS_LIST, cb);
  }

  static getAllVersionsList(cb) {
    var releases = [];
    this.getVanillaReleases((vanilla_releases) => {
      vanilla_releases.forEach((vanilla_release) => {
        var vversionItem = {
          version: vanilla_release.version,
          url: vanilla_release.manifestURL,
          type: "vanilla",
        };
        releases.push(vversionItem);
      });
      this.getForgeReleases((forge_releases) => {
        for (const [key, value] of Object.entries(forge_releases)) {
          var fversionItem = {
            version: key,
            forgeBuild: value,
            type: "forge",
          };
          releases.push(fversionItem);
        }
        this.getFabricAvailableVersions((fabric_versions) => {
          fabric_versions.forEach((fabric_version) => {
            var fbversionItem = {
              version: fabric_version,
              type: "fabric",
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
          cb(releases);
        });
      });
    });
  }

  static generateVersionDisplayname(version) {
    switch (version.type) {
      case "vanilla":
        return "Версия " + version.version;
      case "forge":
        return "Версия Forge " + version.version;
      case "fabric":
        return "Версия Fabric " + version.version;
    }
  }

  static getInstallerVersionsList() {
    var versPath = path.join(mainConfig.selectedBaseDirectory, "versions");
    if (fs.existsSync(versPath)) {
      var directories = [];
      var rddrs = fs.readdirSync(versPath);
      rddrs.forEach(function (item) {
        if (fs.lstatSync(path.join(versPath, item)).isDirectory()) {
          directories.push(item);
        }
      });
      return directories;
    } else {
      return [];
    }
  }
}
