const ELYBY_ENDPOINT = "https://authserver.ely.by";
const ELYBY_AUTH_URL = "/auth/authenticate";
const ELYBY_REFRESH_URL = "/auth/refresh";
const ELYBY_VALIDATE_URL = "/auth/validate";

class FrogElybyManager {
  static loginAccount(cb, login, password, clientToken, token = "") {
    if (token != "") {
      password = password + ":" + token;
    }
    $.post(ELYBY_ENDPOINT + ELYBY_AUTH_URL, {
      username: login,
      password: password,
      clientToken: clientToken,
      requestUser: true,
    }).always((data) => {
      if (typeof data.responseJSON !== "undefined") {
        cb(data.responseJSON);
      } else {
        cb(data);
      }
    });
  }

  static refreshAuthToken(cb, authToken, clientToken, requestUser = false) {
    $.post(ELYBY_ENDPOINT + ELYBY_REFRESH_URL, {
      authToken: authToken,
      clientToken: clientToken,
      requestUser: requestUser,
    }).always((data) => {
      if (typeof data.responseJSON !== "undefined") {
        cb(data.responseJSON);
      } else {
        cb(data);
      }
    });
  }

  static validateAccessToken(cb, accessToken) {
    $.post(ELYBY_ENDPOINT + ELYBY_VALIDATE_URL, {
      accessToken: accessToken,
    }).always((data) => {
      if (typeof data.responseJSON !== "undefined") {
        cb(false);
      } else {
        if(data == ""){
          cb(true);
        } else {
          cb(false);
        }
      }
    });
  }
}
