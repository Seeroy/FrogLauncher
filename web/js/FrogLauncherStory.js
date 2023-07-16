class FrogLauncherStory {
  static showStory() {
    $(".launcher-story").removeClass("hidden");
    animateCSSJ(".launcher-story", "fadeIn", true);
  }

  static hideStory() {
    animateCSSJ(".launcher-story", "fadeOut", true).then(() => {
      $(".launcher-story").addClass("hidden");
    });
  }

  static endStory() {
    mainConfig.launcherStoryViewed = true;
    FrogConfigManager.writeMainConfig(mainConfig);
    this.hideStory();
  }

  static refreshLauncherStory() {
    $(".sidebar-item").each(function (i, elem) {
      var boundings = $(elem)[0].getBoundingClientRect();
      if ($(elem).data("modal") != null) {
        var storyElem = $(".launcher-story #ss-" + $(elem).data("modal"));
      } else {
        var storyElem = $(".launcher-story #ss-console");
      }
      $(storyElem).css("top", boundings.top + 10);
      $(storyElem).css("left", boundings.left + 80);
    });
    var susBoundings = $(
      ".launcher-story #show-users-select-clone"
    )[0].getBoundingClientRect();
    $(".launcher-story #ss-show-users-select").css(
      "top",
      susBoundings.top - 24
    );
    $(".launcher-story #ss-show-users-select").css(
      "left",
      susBoundings.left + 8
    );
    var svsBoundings = $(
      ".launcher-story #show-version-selector-clone"
    )[0].getBoundingClientRect();
    $(".launcher-story #ss-show-version-selector").css(
      "top",
      svsBoundings.top - 24
    );
    $(".launcher-story #ss-show-version-selector").css(
      "left",
      svsBoundings.left + 8
    );
  }

  static prepareLauncherStory() {
    $(".sidebar-item").each(function (i, elem) {
      FrogLauncherStory.cloneElementToStory(elem, ".sidebar-item", 8);
    });
    this.cloneElementToStory(
      "#show-users-select",
      "#show-users-select",
      2,
      true,
      32,
      "show-users-select-clone"
    );
    this.cloneElementToStory(
      "#show-version-selector",
      "#show-version-selector",
      2,
      true,
      32,
      "show-version-selector-clone"
    );
  }

  static cloneElementToStory(
    elem,
    findd,
    top,
    hidden = false,
    left = 0,
    id = null
  ) {
    var boundings = $(elem)[0].getBoundingClientRect();
    var elHTML = $(elem)[0].outerHTML;
    var clEl = document.createElement("div");
    clEl.innerHTML = elHTML;
    $(clEl).find(findd).css("position", "absolute");
    $(clEl).find(findd).css("z-index", "8");
    $(clEl)
      .find(findd)
      .css("left", boundings.left + left);
    $(clEl)
      .find(findd)
      .css("top", boundings.top - top);
    $(clEl).find(findd).css("bottom", "0");
    $(clEl).find(findd).css("right", "0");
    $(clEl).find(findd).css("width", "max-content");
    $(clEl).find(findd).css("height", "max-content");
    if (id != null) {
      $(clEl).find(findd).prop("id", id);
    }
    if (hidden == true) {
      $(clEl).css("opacity", "0");
      $(clEl).css("pointer-events", "none");
    }
    $(".launcher-story").append(clEl);
  }
}
