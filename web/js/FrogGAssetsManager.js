const VER_MANIFEST_URL =
  "https://froglauncher.seeroy.ru/repo/version_manifest.json";
const GA_ASSETS_URL = "https://resources.download.minecraft.net";

class FrogGAssetsManager {
  // Get versions manifest
  static getVersionManifest(cb) {
    $.get(VER_MANIFEST_URL, cb);
  }

  // Get package file by version
  static getPackageByVersion(version, cb) {
    var isSuccess = false;
    var packageObject = false;
    this.getVersionManifest((manifest) => {
      manifest.versions.forEach((item) => {
        if (item.id == version) {
          isSuccess = true;
          $.get(item.url, (pkgData) => {
            packageObject = pkgData;
            if (isSuccess != false && packageObject != false) {
              cb(packageObject);
            } else {
              cb(false);
            }
          });
        }
      });
    });
  }

  static getAssetsJSONByVersion(version, cb) {
    this.getPackageByVersion(version, (pkg) => {
      $.get(pkg.assetIndex.url, cb);
    });
  }

  static getFilesDownloadList(version, cb) {
    var dlList = [];
    this.getPackageByVersion(version, (pkg) => {
      this.getAssetsJSONByVersion(version, (assets) => {
        pkg.libraries.forEach((library) => {
          if (
            !this.verifyFile(
              library.downloads.artifact.path,
              library.downloads.artifact.sha1,
              "libraries"
            )
          ) {
            dlList.push(library.downloads.artifact);
          }
        });
        for (const [key, value] of Object.entries(assets.objects)) {
          var hash = value.hash;
          var subhash = hash.substring(0, 2);
          if (!this.verifyFile(path.join(subhash, hash), hash, "assets")) {
            dlList.push({
              path: path.join(subhash, hash),
              sha1: hash,
              url: GA_ASSETS_URL + "/" + hash + subhash
            });
          }
        }
        cb(dlList);
      });
    });
  }

  static verifyFile(filePath, sha1, type) {
    var fullPath = path.join(mainConfig.selectedBaseDirectory, type, filePath);
    var chkResult = false;
    if (fs.existsSync(fullPath)) {
      var sha1sum = crypto
        .createHash("sha1")
        .update(fs.readFileSync(fullPath))
        .digest("hex");
      if (sha1sum == sha1) {
        chkResult = true;
      }
    }
    return chkResult;
  }
}
