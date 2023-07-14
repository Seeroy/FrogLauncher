const ACCOUNTS_LIST_ITEM_BASE =
  '<div class="flex p-2 rounded-lg user-item" onclick="FrogUI.changeActiveAccount(' +
  "'$1'" +
  ')"> <div class="flex items-center h-8"> <img src="https://minotar.net/avatar/$1/24" /> </div> <div class="ml-2 text-sm text-white"> <div>$1</div> <p class="text-xs font-normal text-gray-400">$2</p> </div> </div>';
const ACCOUNTS_LIST_ITEM_LOCAL = "Локальный аккаунт";
const ACCOUNTS_LIST_ITEM_MS = "Аккаунт Microsoft";
const ACCOUNTS_LIST_ITEM_NEW =
  '<div class="flex p-2 rounded-lg user-item" onclick="FrogUI.newAccountWizard()"> <div class="flex items-center h-8"> <span class="material-symbols-rounded text-white" style="font-size: 24px;">add</span> </div> <div class="ml-2 text-sm text-white"> <div>Добавить аккаунт</div> <p class="text-xs font-normal text-gray-400">Добавить новый аккаунт</p> </div> </div>';
const GAME_VERSION_ITEM_BASE =
  '<li class="version-item" data-version="$1" data-uuid="$5"><img src="assets/ver_icons/$2.png" style="height: 24px" /><span class="ml-3">$3</span>$4</li>';
const GAME_VERSION_INSTALLED = '<span class="gray ml-2">(Установлена)</span>';
const USER_SELECT_BTN_BASE = '<div class="flex rounded items-center"><img src="$1"><div class="ml-3">$2</div></div>'

class FrogUI {
  static loadSection = (selector, section) => {
    FrogBackendCommunicator.logBrowserConsole(
      "[UI]",
      "Loading section:",
      section
    );
    $.get("sections/" + section + ".html", (sectionCode) => {
      $(selector).append(sectionCode);
    });
  };

  static addSectionIntoBody = (section) => {
    FrogBackendCommunicator.logBrowserConsole(
      "[UI]",
      "Loading section:",
      section
    );
    $.get("sections/" + section + ".html", (sectionCode) => {
      $(".window-frame").append(sectionCode);
    });
  };

  static showPreloader = (text = "") => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Show preloader");
    if (text != "") {
      $(".preloader-container .preloader-desc").text(text);
    }
    $(".preloader-container").removeClass("hidden");
    animateCSS(".preloader-container", "fadeIn", true);
  };

  static hidePreloader = () => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Hide preloader");
    animateCSS(".preloader-container", "fadeOut", true).then(() => {
      $(".preloader-container").addClass("hidden");
    });
  };

  static showMenuModal = (menu) => {
    $("#" + menu + "-mmodal").removeClass("hidden");
    animateCSS("#" + menu + "-mmodal", "fadeIn", true);
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Show menu modal:", menu);
  };

  static hideMenuModal = (menu) => {
    animateCSS("#" + menu + "-mmodal", "fadeOut", true).then(() => {
      $("#" + menu + "-mmodal").addClass("hidden");
      FrogBackendCommunicator.logBrowserConsole(
        "[UI]",
        "Hide menu modal:",
        menu
      );
    });
  };

  static goHomeSection = () => {
    FrogUI.setSidebarActiveItemByModalData("home");
    $(".modal-bg:not(.hidden)").each(function (i, elem) {
      var cleanId = $(elem)[0].id.replace(/\-mmodal/gim, "");
      FrogUI.hideMenuModal(cleanId);
    });
  };

  static setSidebarActiveItemByModalData = (modalName) => {
    FrogUI.setUnactiveActivatedSidebarItem();
    $(".sidebar .sidebar-item").each(function (i, elem) {
      var modalData = $(elem).data("modal");
      if (modalData == modalName) {
        $(this).addClass("bg-primary-600 active");
      }
    });
  };

  static setUnactiveActivatedSidebarItem = () => {
    $(".sidebar .sidebar-item.active").removeClass("active bg-primary-600");
  };

  static refreshAbsoluteElementsPositions = () => {
    var usmb_boundings = $("#show-users-select")[0].getBoundingClientRect();
    var usm_boundings = $(".users-select-modal")[0].getBoundingClientRect();
    $(".users-select-modal").css(
      "top",
      usmb_boundings.y - usm_boundings.height - 24
    );
    $(".users-select-modal").css("left", usmb_boundings.x);

    var nam_boundings = $(".new-account-modal")[0].getBoundingClientRect();
    $(".new-account-modal").css(
      "top",
      usmb_boundings.y - nam_boundings.height - 24
    );
    $(".new-account-modal").css("left", usmb_boundings.x);

    var memtb_boundings = $("#showMemTooltip")[0].getBoundingClientRect();
    var memt_boundings = $("#memTooltip")[0].getBoundingClientRect();
    $("#memTooltip").css("top", memtb_boundings.y + 4);
    $("#memTooltip").css("left", memtb_boundings.x + memt_boundings.width + 8);
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
  };

  static newAccountWizard = () => {
    $(".new-account-modal").removeClass("hidden");
    this.refreshAbsoluteElementsPositions();
  };

  static newLocalAccountWizard = () => {
    accountsConfig = FrogAccountManager.getAccounts();
    $("#add-local-account-mmodal input").val("");
    $("#add-local-account-mmodal .error-text").addClass("hidden");
    $("#add-local-account-mmodal .custom-button").prop("disabled", true);
    this.showMenuModal("add-local-account");
    $(".new-account-modal").addClass("hidden");
  };

  static newMSAccountWizard = () => {
    accountsConfig = FrogAccountManager.getAccounts();
    this.showMenuModal("add-ms-account");
    $(".new-account-modal").addClass("hidden");
    FrogAccountManager.addMicrosoftAccount(() => {
      FrogUI.goHomeSection();
      FrogUI.refreshAccountsDropdown();
    });
  };

  static applyTheme = (theme, withBlackScreenAnim = false) => {
    if (withBlackScreenAnim == true) {
      $(".blackscreen").removeClass("hidden");
      animateCSS(".blackscreen", "fadeIn", true).then(() => {
        animateCSS(".blackscreen", "fadeOut", true).then(() => {
          $(".blackscreen").addClass("hidden");
        });
      });
    }
    setTimeout(function () {
      $("html").removeClass(
        "indigo red yellow gradient-blue gradient-fire gray blue turquoise minecrafty"
      );
      $("html").addClass(theme);
      mainConfig.selectedTheme = theme;
      FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
      FrogUI.refreshModalThemesList(); // In sections/themesModal.html
      FrogBackendCommunicator.logBrowserConsole(
        "[UI]",
        "Changing theme to",
        theme
      );
    }, 350);
  };

  static refreshModalThemesList = () => {
    $("#themes-mmodal .themes-items .bg-primary-1000").each(function (i, item) {
      if ($("html").hasClass($(item).data("theme"))) {
        $(item).find(".custom-button").addClass("hidden");
        $(item).find(".material-symbols-rounded").removeClass("hidden");
      } else {
        $(item).find(".custom-button").removeClass("hidden");
        $(item).find(".material-symbols-rounded").addClass("hidden");
      }
    });
  };

  static changeActiveAccount = (nickname) => {
    if (FrogAccountManager.isAccountExists(nickname)) {
      FrogBackendCommunicator.logBrowserConsole(
        "[ACCMAN]",
        "Changing active account to",
        nickname
      );
      currentSelectedAccount = FrogAccountManager.getAccountByName(nickname);
      $("#show-users-select").html(USER_SELECT_BTN_BASE.replaceAll(/\$1/gmi, "https://minotar.net/avatar/" + nickname + "/24").replaceAll(/\$2/gmi, nickname));
      mainConfig.lastSelectedAccount = nickname;
      FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
    }
  };

  static changeActiveVersion = (version, code) => {
    FrogBackendCommunicator.logBrowserConsole(
      "[ACCMAN]",
      "Changing active version to",
      version.version
    );
    if (FrogAccountManager.isAccountExists(nickname)) {

      currentSelectedAccount = FrogAccountManager.getAccountByName(nickname);
      $("#show-version-selector").html(code);
      mainConfig.lastSelectedAccount = nickname;
      FrogConfigManager.writeAndRefreshMainConfig(mainConfig);
    }
  };

  static refreshVersionsListModal = (filters = "all all") => {
    var vi,
      accepted = false;
    var filters = filters.split(" ");
    FrogVersionsManager.getAllVersionsList((gameVersions) => {
      $("#version-selector-mmodal #game-versions-list").html("");
      gameVersions.forEach((version) => {
        if (
          filters[0] == "all" ||
          (filters[0] == "installed" && version.installed == true)
        ) {
          if (
            filters[1] == "all" ||
            (filters[1] == "forge" && version.type == "forge") ||
            (filters[1] == "fabric" && version.type == "fabric") ||
            (filters[1] == "vanilla" && version.type == "vanilla")
          ) {
            accepted = true;
          } else {
            accepted = false;
          }
        } else {
          accepted = false;
        }

        if (
          typeof version.installed !== "undefined" &&
          version.installed == true
        ) {
          vi = GAME_VERSION_INSTALLED;
        } else {
          vi = "";
        }

        if (accepted == true) {
          $("#version-selector-mmodal #game-versions-list").append(
            GAME_VERSION_ITEM_BASE.replaceAll(/\$1/gim, version.version)
              .replaceAll(/\$2/gim, version.type)
              .replaceAll(
                /\$3/gim,
                FrogVersionsManager.generateVersionDisplayname(version)
              )
              .replaceAll(/\$4/gim, vi).replaceAll(/\$5/gim, version.id)
          );
        }
      });
    });
  };
}

const animateCSS = (element, animation, fast = true, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

    if (fast == true) {
      node.classList.add(`${prefix}animated`, animationName, `${prefix}faster`);
    } else {
      node.classList.add(`${prefix}animated`, animationName);
    }

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(
        `${prefix}animated`,
        animationName,
        `${prefix}faster`
      );
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

function padU(s) {
  return (s < 10 ? "0" : "") + s;
}
