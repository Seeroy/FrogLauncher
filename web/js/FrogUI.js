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
