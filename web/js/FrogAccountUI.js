const ACCOUNTS_LIST_ITEM_BASE =
  '<div class="flex p-2 rounded-lg user-item" onclick="FrogAccountUI.changeActiveAccount(' +
  "'$1'" +
  ')"> <div class="flex items-center h-8"> <img src="https://minotar.net/avatar/$1/24" /> </div> <div class="ml-2 text-sm text-white"> <div>$1</div> <p class="text-xs font-normal text-gray-400">$2</p> </div> <div class="grow"></div> <button type="button" class="font-medium rounded-lg text-sm text-center border-gray-600 text-red-500 hover:text-white" onclick="FrogAccountUI.deleteAccountAndRefresh(' +
  "'$1'" +
  ')"><span class="material-symbols-rounded" style="margin-top: 3px;">delete</span></button> </div>';
const ACCOUNTS_LIST_ITEM_LOCAL = "Локальный аккаунт";
const ACCOUNTS_LIST_ITEM_MS = "Аккаунт Microsoft";
const ACCOUNTS_LIST_ITEM_NEW =
  '<div class="flex p-2 rounded-lg user-item" onclick="FrogAccountUI.newAccountWizard()"> <div class="flex items-center h-8"> <span class="material-symbols-rounded text-white" style="font-size: 24px;">add</span> </div> <div class="ml-2 text-sm text-white"> <div>Добавить аккаунт</div> <p class="text-xs font-normal text-gray-400">Добавить новый аккаунт</p> </div> </div>';
const USER_SELECT_BTN_BASE =
  '<div class="flex rounded items-center"><img src="$1"><div class="ml-3">$2</div></div>';

class FrogAccountUI {
  static changeActiveAccount = (nickname) => {
    if (nickname == -1) {
      // There is no any accounts
      $("#show-users-select").html("Аккаунт не выбран");
    } else {
      if (FrogAccountManager.isAccountExists(nickname)) {
        FrogBackendCommunicator.logBrowserConsole(
          "[ACCMAN]",
          "Changing active account to",
          nickname
        );
        $("#show-users-select").html(
          USER_SELECT_BTN_BASE.replaceAll(
            /\$1/gim,
            "https://minotar.net/avatar/" + nickname + "/24"
          ).replaceAll(/\$2/gim, nickname)
        );
        mainConfig.lastSelectedAccount = nickname;
        selectedAccount = FrogAccountManager.getAccountByName(nickname);
        FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
      }
    }
  };

  static refreshAccountsDropdown = (cb = () => {}) => {
    accountsConfig = FrogAccountManager.getAccounts();
    $(".users-select-modal").html("");
    accountsConfig.forEach((account) => {
      if (account.type == "local") {
        $(".users-select-modal").append(
          ACCOUNTS_LIST_ITEM_BASE.replaceAll(
            /\$1/gim,
            account.nickname
          ).replaceAll(/\$2/gim, ACCOUNTS_LIST_ITEM_LOCAL)
        );
      } else {
        $(".users-select-modal").append(
          ACCOUNTS_LIST_ITEM_BASE.replaceAll(
            /\$1/gim,
            account.nickname
          ).replaceAll(/\$2/gim, ACCOUNTS_LIST_ITEM_MS)
        );
      }
    });
    $(".users-select-modal").append(ACCOUNTS_LIST_ITEM_NEW);
    cb();
  };

  static newAccountWizard = () => {
    $(".new-account-modal").removeClass("hidden");
    FrogUI.refreshAbsoluteElementsPositions();
  };

  static newLocalAccountWizard = () => {
    accountsConfig = FrogAccountManager.getAccounts();
    $("#add-local-account-mmodal input").val("");
    $("#add-local-account-mmodal .error-text").addClass("hidden");
    $("#add-local-account-mmodal .custom-button").prop("disabled", true);
    FrogUI.showMenuModal("add-local-account");
    $(".new-account-modal").addClass("hidden");
  };

  static newMSAccountWizard = () => {
    accountsConfig = FrogAccountManager.getAccounts();
    FrogUI.showMenuModal("add-ms-account");
    $(".new-account-modal").addClass("hidden");
    FrogAccountManager.addMicrosoftAccount(() => {
      FrogUI.goHomeSection();
      FrogAccountUI.refreshAccountsDropdown();
    });
  };

  static deleteAccountAndRefresh = (nickname) => {
    FrogAccountManager.deleteAccount(nickname);
    this.refreshAccountsDropdown(() => {
      if (selectedAccount != null && selectedAccount.nickname == nickname) {
        var accountsList = FrogAccountManager.getAccounts();
        if (accountsList.length > 0) {
          this.changeActiveAccount(accountsList[0].nickname);
        } else {
          this.changeActiveAccount(-1);
        }
      }
      Toaster("Аккаунт успешно удалён", 2500, false, "success");
    });
  };
}
