const VER_MANIFEST_URL =
  "https://froglauncher.seeeroy.ru/repo/version_manifest.json";
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
      $.get(pkg.assetIndex.url, (data) => {
        cb(data.objects);
      });
    });
  }

  static getFilesDownloadList(gameDirectory, version, cb) {
    var dlList = [];
    this.getPackageByVersion(version, (pkg) => {
      this.getAssetsJSONByVersion(version, (assets) => {
        pkg.libraries.forEach((library) => {
          library.downloads.artifact.path = path.resolve(path.join(gameDirectory, "libraries", library.downloads.artifact.path));
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
        for (const [key, value] of Object.entries(assets)) {
          var hash = value.hash;
          var subhash = hash.substring(0, 2);
          var fullPath = path.resolve(path.join(gameDirectory, "assets", subhash, hash));
          if (!this.verifyFile(fullPath, hash, "assets")) {
            dlList.push({
              path: fullPath,
              sha1: hash,
              url: GA_ASSETS_URL + "/" + hash + subhash
            });
          }
        }
        if(typeof pkg.logging.client.file !== "undefined"){
          var fullPath = path.resolve(path.join(gameDirectory, pkg.logging.client.file.id));
          if(!this.verifyFile(fullPath, pkg.logging.client.sha1)){
            dlList.push(pkg.logging.client.file);
          }
        }
        if(typeof pkg.downloads.client !== "undefined"){
          var fullPath = path.resolve(path.join(gameDirectory, pkg.downloads.client));
          if(!this.verifyFile(fullPath, pkg.logging.client.sha1)){
            dlList.push(pkg.logging.client.file);
          }
        }
        cb(dlList);
      });
    });
  }

  static verifyFile(fullPath, sha1) {
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
