class FrogUI {
  static loadSection = (selector, section) => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Loading section:", section);
    $.get("sections/" + section + ".html", (sectionCode) => {
      $(selector).append(sectionCode);
    });
  }

  static addSectionIntoBody = (section) => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Loading section:", section);
    $.get("sections/" + section + ".html", (sectionCode) => {
      $(".window-frame").append(sectionCode);
    });
  }

  static showPreloader = (text = "") => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Show preloader");
    if(text != ""){
      $(".preloader-container .preloader-desc").text(text);
    }
    $(".preloader-container").removeClass("hidden");
    animateCSS(".preloader-container", "fadeIn", true);
  }

  static hidePreloader = () => {
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Hide preloader");
    animateCSS(".preloader-container", "fadeOut", true).then(() => {
      $(".preloader-container").addClass("hidden");
    });
  }

  static showMenuModal = (menu) => {
    $("#" + menu + "-mmodal").removeClass("hidden");
    animateCSS("#" + menu + "-mmodal", "fadeIn", true);
    FrogBackendCommunicator.logBrowserConsole("[UI]", "Show menu modal:", menu);
  }

  static hideMenuModal = (menu) => {
    animateCSS("#" + menu + "-mmodal", "fadeOut", true).then(() => {
      $("#" + menu + "-mmodal").addClass("hidden");
      FrogBackendCommunicator.logBrowserConsole("[UI]", "Hide menu modal:", menu);
    });
  }

  static goHomeSection = () => {
    FrogUI.setSidebarActiveItemByModalData("home");
    $(".modal-bg:not(.hidden)").each(function (i, elem) {
      var cleanId = $(elem)[0].id.split("-")[0];
      FrogUI.hideMenuModal(cleanId);
    });
  }

  static setSidebarActiveItemByModalData = (modalName) => {
    FrogUI.setUnactiveActivatedSidebarItem();
    $(".sidebar .sidebar-item").each(function (i, elem) {
      var modalData = $(elem).data("modal");
      if(modalData == modalName){
        $(this).addClass("bg-primary-600 active");
      }
    });
  }

  static setUnactiveActivatedSidebarItem = () => {
    $(".sidebar .sidebar-item.active").removeClass("active bg-primary-600");
  }
}

const animateCSS = (element, animation, fast = true, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

    if(fast == true){
      node.classList.add(`${prefix}animated`, animationName, `${prefix}faster`);
    } else {
      node.classList.add(`${prefix}animated`, animationName);
    }

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName, `${prefix}faster`);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
  });