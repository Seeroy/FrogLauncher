const LATEST_UPDATE_YML_URL =
  "http://froglauncher.seeeroy.ru/updates/latest.yml";
const LATEST_UPDATE_CHANGELOG_URL =
  "http://froglauncher.seeeroy.ru/updates/changelog.txt";

class FrogUpdateHandler {
  static bindUpdate() {
    ipcRenderer.once("update-available", () => {
        FrogUpdateHandler.onUpdateAvailable();
    });
    ipcRenderer.once("update-downloaded", () => {
        FrogUpdateHandler.onUpdateDownloaded();
    });
  }

  static onUpdateAvailable() {
    this.getLatestUpdateVersion((version) => {
        Toaster("Доступно новое обновление " + version + "<br>Мы уже скачиваем его", 5000, false, "update");
    });
  }

  static onUpdateDownloaded() {
    this.getLatestUpdateVersion((version) => {
      this.getLatestUpdateChangelog((changelog) => {
        FrogNotifyModal.create(
          "Мы скачали обновление " + version,
          changelog,
          "Установить",
          "update",
          FrogUpdateHandler.installUpdate,
          '<a class="font-medium text-blue-600 dark:text-blue-500 hover:underline mt-4 cursor-pointer" onclick="$(this).parent().parent().remove()">Закрыть</a>'
        );
      });
    });
  }

  static getLatestUpdateVersion(cb) {
    $.get(LATEST_UPDATE_YML_URL, (yml) => {
      cb(yml.split("\n")[0].split(":")[1].trim());
    });
  }

  static getLatestUpdateChangelog(cb) {
    $.get(LATEST_UPDATE_CHANGELOG_URL, cb);
  }

  static installUpdate(){
    FrogBackendCommunicator.installUpdate();
  }
}
