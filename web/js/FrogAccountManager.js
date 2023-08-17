const NICKNAME_REGEX = /^[a-zA-Z0-9_]{2,16}$/gm;
var currentSelectedAccount;

class FrogAccountManager {
  static getAccounts() {
    if (fs.existsSync(path.join(__appData, "frog_accounts.json"))) {
      return JSON.parse(
        fs.readFileSync(path.join(__appData, "frog_accounts.json"))
      );
    } else {
      return this.resetAccountsList();
    }
  }

  static saveAccounts(accounts) {
    fs.writeFileSync(
      path.join(__appData, "frog_accounts.json"),
      JSON.stringify(accounts, null, "\t")
    );
    return true;
  }

  static resetAccountsList() {
    fs.writeFileSync(path.join(__appData, "frog_accounts.json"), "[]");
    FrogBackendCommunicator.logBrowserConsole(
      "[ACCMAN]",
      "Accounts list is cleared successfully"
    );
    return [];
  }

  static addLocalAccount(nickname) {
    var nmatch = nickname.match(NICKNAME_REGEX);
    if (nmatch != null && nmatch.length > 0) {
      var accountsList = this.getAccounts();
      var newAccount = {
        id: accountsList.length,
        type: "local",
        nickname: nickname,
        added: Date.now(),
        uuid: crypto.randomUUID(),
      };
      accountsList.push(newAccount);
      this.saveAccounts(accountsList);
      FrogBackendCommunicator.logBrowserConsole(
        "[ACCMAN]",
        "New local account added:",
        nickname
      );
      Toaster(
        "<span class='text-md text-gray-400'>Добавлен новый локальный аккаунт</span><p class='text-lg mc-text'>" +
          nickname +
          "</p>",
        5000,
        false,
        "success"
      );
      return true;
    } else {
      FrogBackendCommunicator.logBrowserConsole(
        "[ACCMAN]",
        "New local account NOT added due to invalid nickname"
      );
      return false;
    }
  }

  static addElybyAccount(cb, login, password) {
    var randClientUUID = crypto.randomUUID();
    FrogElybyManager.loginAccount(
      (data) => {
        if (typeof data !== "undefined") {
          if (typeof data.errorMessage !== "undefined") {
            FrogNotifyModal.create(
              "<span class='text-md text-gray-400' style='margin-top: -40px;'>Ошибка добавления аккаунта Ely.by</span>",
              data.errorMessage,
              "Понятно",
              "error"
            );
            cb();
          } else {
            var accountsList = this.getAccounts();
            var newAccount = {
              id: accountsList.length,
              type: "elyby",
              nickname: data.selectedProfile.name,
              added: Date.now(),
              clientToken: randClientUUID,
              accessToken: data.accessToken,
              userUUID: data.selectedProfile.id,
            };
            accountsList.push(newAccount);
            this.saveAccounts(accountsList);
            Toaster(
              "<span class='text-md text-gray-400'>Добавлен новый аккаунт Ely.by</span><p class='text-lg mc-text'>" +
                data.selectedProfile.name +
                "</p>",
              5000,
              false,
              "success"
            );
          }
        } else {
          FrogNotifyModal.create(
            "<span class='text-md text-gray-400' style='margin-top: -40px;'>Ошибка добавления аккаунта Ely.by</span>",
            "Server error: data empty",
            "Понятно",
            "error"
          );
        }
        cb();
      },
      login,
      password,
      randClientUUID
    );
  }

  static addMicrosoftAccount(cb) {
    var authManager = new Auth("select_account");
    authManager.launch("raw").then(async (xboxManager) => {
      // Generating token
      const token = await xboxManager.getMinecraft();
      var nickname = token.profile.name;
      if (!this.isAccountExists(nickname)) {
        // Creating account
        var accountsList = this.getAccounts();
        var newAccount = {
          id: accountsList.length,
          type: "microsoft",
          added: Date.now(),
          nickname: nickname,
          authorizationData: token.mclc(),
        };
        accountsList.push(newAccount);
        this.saveAccounts(accountsList);
        FrogBackendCommunicator.logBrowserConsole(
          "[ACCMAN]",
          "New Microsoft account added:",
          nickname
        );
        Toaster(
          "<span class='text-md text-gray-400'>Добавлен новый аккаунт Microsoft</span><p class='text-lg mc-text'>" +
            nickname +
            "</p>",
          5000,
          false,
          "success"
        );
        cb();
      } else {
        Toaster("Этот аккаунт уже был добавлен ранее", 2500, false, "error");
        FrogBackendCommunicator.logBrowserConsole(
          "[ACCMAN]",
          "New Microsoft account NOT added due to is already exists"
        );
        cb();
      }
    });
  }

  static generateAuthCredetinals(account, cb) {
    if (account.type == "local") {
      Authenticator.getAuth(account.nickname).then((authData) => {
        cb(authData);
      });
    } else if (account.type == "microsoft") {
      cb(account.authorizationData);
    } else if (account.type == "elyby") {
      FrogElybyManager.validateAccessToken((valResult) => {
        if (valResult == false) {
          FrogElybyManager.refreshAuthToken(
            (refreshResult) => {
              var accountNeedToBeFixed = -1;
              accountsConfig.forEach((faccount, i) => {
                if (faccount.nickname == account.nickname) {
                  accountNeedToBeFixed = i;
                }
              });
              if (accountNeedToBeFixed != -1) {
                accountsConfig[accountNeedToBeFixed].accessToken =
                  refreshResult.accessToken;
                accountsConfig[accountNeedToBeFixed].uuid =
                  refreshResult.selectedProfile.id;
                accountsConfig[accountNeedToBeFixed].name =
                  refreshResult.selectedProfile.name;
                this.saveAccounts(accountsConfig);
              }
              cb({
                access_token: accountsConfig[accountNeedToBeFixed].accessToken,
                client_token: accountsConfig[accountNeedToBeFixed].clientToken,
                uuid: accountsConfig[accountNeedToBeFixed].userUUID,
                name: accountsConfig[accountNeedToBeFixed].nickname,
              });
            },
            account.accessToken,
            account.clientToken
          );
        } else {
          cb({
            access_token: account.accessToken,
            client_token: account.clientToken,
            uuid: account.userUUID,
            name: account.nickname,
          });
        }
      }, account.accessToken);
    }
  }

  static isAccountExists(nickname) {
    var isExists = false;
    var accsConfig = this.getAccounts();
    accsConfig.forEach((account) => {
      if (account.nickname == nickname) {
        isExists = true;
      }
    });
    return isExists;
  }

  static getAccountByName(nickname) {
    var retAccount = false;
    var accsConfig = this.getAccounts();
    accsConfig.forEach((account) => {
      if (account.nickname == nickname) {
        retAccount = account;
      }
    });
    return retAccount;
  }

  static deleteAccount(nickname) {
    if (this.isAccountExists(nickname)) {
      var accsConfig = this.getAccounts();
      accsConfig.forEach((account, i) => {
        if (account.nickname == nickname) {
          accsConfig.splice(i, 1);
        }
      });
      this.saveAccounts(accsConfig);
      FrogBackendCommunicator.logBrowserConsole(
        "[ACCMAN]",
        "Account succesfully deleted:",
        nickname
      );
      return true;
    } else {
      return false;
    }
  }
}
