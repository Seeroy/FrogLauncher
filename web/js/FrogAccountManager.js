const NICKNAME_REGEX = /^[a-zA-Z0-9_]{2,16}$/gm;
var currentSelectedAccount;

class FrogAccountManager {
  static getAccounts() {
    if (fs.existsSync("frog_accounts.json")) {
      return JSON.parse(fs.readFileSync("frog_accounts.json"));
    } else {
      return this.resetAccountsList();
    }
  }

  static saveAccounts(accounts) {
    fs.writeFileSync("frog_accounts.json", JSON.stringify(accounts));
    return true;
  }

  static resetAccountsList() {
    fs.writeFileSync("frog_accounts.json", "[]");
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
        "Добавлен новый локальный аккаунт <p class='mc-text'>" +
          nickname +
          "</p>",
        3000,
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

  static addMicrosoftAccount(cb) {
    var authManager = new Auth("select_account");
    authManager.launch("raw").then(async (xboxManager) => {
      // Generating token
      const token = await xboxManager.getMinecraft();
      var nickname = token.profile.name;
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
        "Добавлен новый аккаунт Microsoft/Mojang <p class='mc-text'>" +
          nickname +
          "</p>",
        3000,
        false,
        "success"
      );
      cb();
    });
  }

  static generateAuthCredetinals(account) {
    if (account.type == "local") {
      return {
        access_token: "null",
        client_token: "null",
        uuid: account.uuid,
        name: account.nickname,
        user_properties: "{}",
        meta: {
          type: "mojang",
          demo: false,
        },
      };
    } else {
      return false; // TODO
    }
  }
}
