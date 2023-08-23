var currentStep = 1;

class FrogOOBEWizard {
  static startOOBE() {
    $(".oobeWizard").removeClass("hidden");
  }

  static nextStep() {
    $(".oobeWizard #step-" + currentStep).addClass("hidden");
    currentStep++;
    $(".oobeWizard #step-" + currentStep).removeClass("hidden");
  }

  static prevStep() {
    $(".oobeWizard #step-" + currentStep).addClass("hidden");
    currentStep--;
    $(".oobeWizard #step-" + currentStep).removeClass("hidden");
  }

  static finishOOBE() {
    mainConfig.oobeFinished = true;
    mainConfig.enableDiscordPresence = $(
      ".oobeWizard #discordrpcOobeCheckbox"
    ).is(":checked");
    mainConfig.eulaAccepted = true;
    FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
    FrogBackendCommunicator.restartLauncher();
  }
}
