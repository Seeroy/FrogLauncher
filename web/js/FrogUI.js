const THEME_ITEM_CODE =
  '<div class="new-theme-item" data-theme="$2" onclick="FrogUI.applyTheme(' + "'$2'" + ', true); FrogUI.refreshModalThemesList();"> <div class="clr-1 $2-theme-color"></div> <div class="clr-2 $2-theme-color-darker"></div> <div class="main $2-theme-color-bg w-full"> <div class="name w-full mc-text">$1</div> <div class="example $2-theme-color">A</div> </div> </div>';
const THEMES_LIST = [
  "indigo",
  "blue",
  "gray",
  "yellow",
  "turquoise",
  "minecrafty",
  "red",
];

class FrogUI {
  static loadSection = (selector, section) => {
    $.get("sections/" + section + ".html", (sectionCode) => {
      $(selector).append(sectionCode);
    });
  };

  static addSectionIntoBody = (section) => {
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
      if (mainConfig.selectedBackground.toString().length > 2) {
        // Nothing
      } else if (mainConfig.selectedBackground > 0) {
        // Nothing
      } else {
        FrogAnimatedBackgrounds.startAnimationByName(
          mainConfig.selectedBackground
        );
      }
      FrogBackendCommunicator.logBrowserConsole(
        "[UI]",
        "Changing theme to",
        theme
      );
    }, 350);
  };

  static refreshModalThemesList = () => {
    this.refreshFullThemesList();
    $("#themes-grid .new-theme-item").each(function (i, item) {
      if ($("html").hasClass($(item).data("theme"))) {
        $(item).addClass("active");
      } else {
        $(item).removeClass("active");
      }
    });
  };

  static refreshFullThemesList = () => {
    $("#themes-grid").html("");
    THEMES_LIST.forEach((theme) => {
      var themeDisplayname = FrogUtils.capitalizeWord(theme);
      $("#themes-grid").append(
        THEME_ITEM_CODE.replaceAll(/\$1/gim, themeDisplayname).replaceAll(
          /\$2/gim,
          theme
        )
      );
    });
  };

  static openGameDirectory() {
    openExternal(mainConfig.selectedBaseDirectory);
  }

  static changeBottomControlsStatus(
    showClickable,
    showProgressBar,
    showProgressDesc,
    progressDescText = "Подождите"
  ) {
    if (showClickable == true) {
      $(".controls button").removeClass("hidden");
      $(".controls #show-users-select").prop("disabled", false);
    } else {
      $(".controls button").addClass("hidden");
      $(".controls #show-users-select").removeClass("hidden");
      $(".controls #show-users-select").prop("disabled", true);
    }

    if (showProgressBar == true) {
      $(".controls .progress-cont").removeClass("hidden");
      $(".controls .progress-cont .progress").removeClass("hidden");
    } else {
      $(".controls .progress-cont").addClass("hidden");
      $(".controls .progress-cont .progress").addClass("hidden");
    }
    if (showProgressDesc == true) {
      $(".controls .progress-cont").removeClass("hidden");
      $(".controls .progress-cont .progress-desc").removeClass("hidden");
    } else {
      $(".controls .progress-cont").addClass("hidden");
      $(".controls .progress-cont .progress-desc").addClass("hidden");
    }
    $(".controls .progress-cont .progress-desc").text(progressDescText);
  }

  static setBottomProgressBar(progress) {
    if (!$(".controls .progress-cont .progress").hasClass("hidden")) {
      $(".controls .progress-cont .progress div").css("width", progress + "%");
    }
  }

  static setBottomProgressDescription(text) {
    if (!$(".controls .progress-cont .progress-desc").hasClass("hidden")) {
      $(".controls .progress-cont .progress-desc").text(text);
    }
  }

  static showDownloadManager(show) {
    if (show == true && $(".downloads-container").hasClass("hidden")) {
      $(".downloads-container").removeClass("hidden");
      animateCSSJ(".downloads-container", "fadeInDown", true);
    } else if (show == false && !$(".downloads-container").hasClass("hidden")) {
      animateCSSJ(".downloads-container", "fadeOutUp", true).then(() => {
        $(".downloads-container").addClass("hidden");
      });
    }
  }

  static refreshCustomBg(arg) {
    if (fs.existsSync(path.join(__appData, "AppCache", arg))) {
      $("#themes-mmodal #bg-selector li .inline-block.active").removeClass(
        "active"
      );
      $("html").removeClass("bg-1 bg-2 bg-3 bg-4 bg-5 bg-6");
      $(".main-bg").css(
        "background",
        'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(255,255,255,0) 80%), url("' +
          path.join(__appData, "AppCache").replaceAll("\\", "/") +
          "/" +
          arg +
          '")'
      );
      mainConfig.selectedBackground = arg;
      FrogConfigManager.writeMainConfig(mainConfig);
    } else {
      mainConfig.selectedBackground = "1";
      $("html").addClass("bg-1");
      FrogConfigManager.writeMainConfig(mainConfig);
    }
  }
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

const animateCSSJ = (element, animation, fast = true, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;

    if (fast == true) {
      $(element).addClass(`${prefix}animated ${animationName} ${prefix}faster`);
    } else {
      $(element).addClass(`${prefix}animated ${animationName}`);
    }

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      $(element).removeClass(
        `${prefix}animated ${animationName} ${prefix}faster`
      );
      resolve("Animation ended");
    }

    $(element)[0].addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  });

function padU(s) {
  return (s < 10 ? "0" : "") + s;
}
