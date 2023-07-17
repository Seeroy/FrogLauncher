var isMCErrorShown = false;

const ERRORS_DESCRIPTIONS = [
  "Данная версия игры несовместима с используемой версией Java.<br>Если вы используете автоматическое определение версии Java, то пожалуйста свяжитесь с разработчиком для исправления ошибки",
  "Похоже версия Java и версия Forge несовместимы!<br>Если вы используете автоматическое определение версии Java, то пожалуйста свяжитесь с разработчиком для исправления ошибки",
  "Не удалось выделить необходимое количество памяти для Java<br>Попробуйте уменьшить количество памяти в настройках лаунчера",
  "Похоже потерялся исполняемый JAR-файл игры <br>Попробуйте перезапустить лаунчер",
  "Лаунчер не может найти исполняемый файл Java!<br>Если вы используете автоматическое определение версии Java, то пожалуйста свяжитесь с разработчиком для исправления ошибки",
  "Похоже конфигурация игры повреждена или создана более новой версией игры. Рекомендуем переустановить игру начисто, сменив в настройках лаунчера путь к папке",
];

const ERRORS_MESSAGES = {
  "java.lang.ClassCastException: class jdk.internal.loader":
    ERRORS_DESCRIPTIONS[0],
  "java.lang.NoSuchMethodError: sun.security.util.ManifestEntryVerifier":
    ERRORS_DESCRIPTIONS[1],
  "java.lang.UnsupportedClassVersionError": ERRORS_DESCRIPTIONS[0],
  "Could not reserve enough space": ERRORS_DESCRIPTIONS[2],
  "Main has been compiled by a more recent": ERRORS_DESCRIPTIONS[0],
  "Error: Unable to access jarfile": ERRORS_DESCRIPTIONS[3],
  "The system cannot find the path specified": ERRORS_DESCRIPTIONS[4],
  "at java.base\/java.io.Reader.\<init\>": ERRORS_DESCRIPTIONS[5],
};

class FrogErrorsParser {
  static parse(line = "", exitCode = 0) {
    var errorHappend = false;
    if (line == "" && exitCode) {
      if (exitCode > 0 && exitCode != 127 && exitCode != 255) {
        FrogBackendCommunicator.logBrowserConsoleOnly(
          "<span class='text-red-500'>Game closed with exit code " +
            exitCode +
            "</span>"
        );
        if(isMCErrorShown == false){
          FrogNotifyModal.create(
            "О нет, что-то пошло не так",
            "Minecraft завершился с кодом ошибки " +
              exitCode +
              "<br>Подрбоная информация в консоли",
            "Закрыть",
            "warning"
          );
        }
        errorHappend = true;
      } else {
        FrogBackendCommunicator.logBrowserConsoleOnly(
          "<span class='text-green-500'>Game closed with exit code " +
            exitCode +
            "</span>"
        );
      }
    } else {
      for (const [key, value] of Object.entries(ERRORS_MESSAGES)) {
        var nreg = new RegExp(key, "gmi");
        if (line.match(nreg) != null && isMCErrorShown == false) {
          isMCErrorShown = true;
          FrogNotifyModal.create(
            "Ой, что-то произошло!",
            value,
            "Закрыть",
            "warning",
            () => {
              isMCErrorShown = false;
            }
          );
          errorHappend = true;
        }
      }
    }
    if (mainConfig.enableSounds == true && errorHappend == true) {
      var errAudio = new Audio("assets/sounds/error.wav");
      errAudio.volume = DEFAULT_SOUNDS_VOL;
      errAudio.play();
    }
  }
}
