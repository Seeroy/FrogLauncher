const STATS_SAVE_ENDPOINT_API = "http://seeroy.ru:8080/save_fl?savedata=";

class FrogStatisticsProvider {
  static collectStats(cb) {
    machineUuid().then((uniqueId) => {
      var javasList = FrogInfo.getJavaBinariesList();
      javasList = JSON.parse(JSON.stringify(javasList));
      var installedVersions = FrogVersionsManager.getInstalledVersionsList();
      var accountsCount = FrogAccountManager.getAccounts().length;

      var platformInfo = {
        name: os.type(),
        release: os.release(),
        arch: process.arch,
        version: os.version(),
      };

      var cpuSummary = os.cpus();

      var cpuInfo = {
        model: cpuSummary[0].model,
        speed: cpuSummary[0].speed,
        cores: cpuSummary.length,
      };

      var collectedStats = {
        platform: platformInfo,
        totalmem: Math.round(os.totalmem() / 1024 / 1024),
        cpu: cpuInfo,
        unique_id: uniqueId,
        version: LAUNCHER_VERSION,
        javas: javasList,
        installed_versions: installedVersions,
        accounts_count: accountsCount,
      };
      cb(collectedStats);
    });
  }

  static sendStats(stats, cb) {
    $.get(
      STATS_SAVE_ENDPOINT_API + encodeURIComponent(JSON.stringify(stats)),
      () => {
        cb();
      }
    );
  }
}
