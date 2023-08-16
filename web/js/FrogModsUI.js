const MOD_ITEM =
  '<div class="mod-item" data-displayed-id="$4"> <div class="mod-icon"><img src="$3"></div> <div class="mod-caption">$1</div> <div class="mod-description"> $2 </div> <div class="mod-stats"> <div class="badge"> <span class="material-symbols-rounded">download</span> <span class="ml-2">$5</span> </div> $6 </div> </div> </div>';
const MOD_VIEWER_ICON = '<img class="mod-icon" src="$1">';
const MOD_VIEWER_GALLERY_ITEM =
  '<img src="$1" class="my-2" style="width: 50vw;">';
const MAX_DESC_LENGTH = 64;
const INSTALLED_MOD_ITEM =
  '<div class="item"> <div class="name">$1</div><button class="custom-button" onclick="FrogModsManager.deleteMod(' +
  "'$1'" +
  '); FrogModsUI.refreshInstalledList();">Удалить</button> </div>';

var currentModsOffset = 0;
var currentModsLimit = 16;
var maxLimits;
var currentModOpened;
var currentDisplayedMods;
var currentModSearchQuery = "";

class FrogModsUI {
  static refreshModloadersList(cb) {
    FrogModsManager.getModloadersList((modloaders) => {
      $("#mods-modloader-selector").html("");
      $("#mods-modloader-selector").append(
        "<option selected value='all'>Любые типы ModLoader</option>"
      );
      modloaders.forEach((mdl) => {
        $("#mods-modloader-selector").append(
          "<option value='" +
            mdl.name +
            "'>" +
            mdl.name.charAt(0).toUpperCase() +
            mdl.name.slice(1) +
            "</option>"
        );
      });
      cb();
    });
  }

  static refreshVersionsList(cb) {
    FrogModsManager.getVersionsList((mrVersions) => {
      $("#mods-version-selector").html("");
      $("#mods-version-selector").append(
        "<option selected value='all'>Любые версии</option>"
      );
      mrVersions.forEach((mrv) => {
        if (mrv.version_type == "release") {
          $("#mods-version-selector").append(
            "<option value='" +
              mrv.version +
              "'>Версия " +
              mrv.version +
              "</option>"
          );
        }
      });
      cb();
    });
  }

  static refreshModsList(offset = 0) {
    FrogModsManager.getMods(
      (mods) => {
        currentDisplayedMods = mods.hits;
        $("#packs-mmodal #modsList").html("");
        maxLimits = mods.total_hits;
        if(mods.hits.length == 0){
          $("#packs-mmodal #modsList").append("<span class='text-2xl' style='margin-top: 25vh'>Мы ничего не нашли ;(</span>");
        }
        mods.hits.forEach((mod, i) => {
          var description = mod.description;
          if (description.length > MAX_DESC_LENGTH) {
            description = description.substring(0, MAX_DESC_LENGTH) + "...";
          }
          var modCats = "";
          mod.display_categories.forEach((cat) => {
            modCats =
              modCats +
              "<div class='badge'>" +
              cat.charAt(0).toUpperCase() +
              cat.slice(1) +
              "</div>";
          });
          $("#packs-mmodal #modsList").append(
            MOD_ITEM.replaceAll(/\$1/gim, mod.title)
              .replaceAll(/\$2/gim, description)
              .replaceAll(/\$3/gim, mod.icon_url)
              .replaceAll(/\$4/gim, i)
              .replaceAll(/\$5/gim, mod.downloads)
              .replaceAll(/\$6/gim, modCats)
          );
        });
        $("#packs-mmodal #modsList .mod-item").click((evt) => {
          var currentModOpened =
            currentDisplayedMods[$(evt.currentTarget).data("displayed-id")];
          console.log(currentModOpened);
          this.loadModIntoViewer(currentModOpened);
          FrogUI.showMenuModal("mod-viewer");
        });
      },
      currentModSearchQuery,
      offset,
      16,
      "downloads",
      this.getFacets()
    );
  }

  static refreshInstalledList() {
    $("#packs-mmodal #installedModsList").html("");
    var installedMods = FrogModsManager.getInstalledMods();
    installedMods.forEach((mod) => {
      $("#packs-mmodal #installedModsList").append(
        INSTALLED_MOD_ITEM.replaceAll(/\$1/gim, mod)
      );
    });
  }

  static loadModIntoViewer(modInfo) {
    $("#mod-viewer-mmodal .mod-name-fill").each((i, elem) => {
      $(elem).text(modInfo.title);
    });
    $("#mod-viewer-mmodal .mod-icon-fill").html(
      MOD_VIEWER_ICON.replaceAll(/\$1/gim, modInfo.icon_url)
    );
    $("#mod-viewer-mmodal .mod-devname-fill").text(modInfo.author);
    $("#mod-viewer-mmodal .mod-downloads-fill").text(modInfo.downloads);
    $("#mod-viewer-mmodal .mod-license-fill").text(modInfo.license);

    $("#mod-viewer-mmodal .mod-gallery-fill").html("");
    modInfo.gallery.forEach((item) => {
      $("#mod-viewer-mmodal .mod-gallery-fill").append(
        MOD_VIEWER_GALLERY_ITEM.replaceAll(/\$1/gim, item)
      );
    });
    $("#mod-viewer-mmodal .mod-versions-fill").html("");
    modInfo.versions.forEach((item) => {
      $("#mod-viewer-mmodal .mod-versions-fill").append(
        "<span> - " + item + "</span>"
      );
    });
    $("#mod-viewer-mmodal .mod-version-selector-fill").html("");
    $.get("https://api.modrinth.com/v2/project/" + modInfo.slug, (prjInfo) => {
      $("#mod-viewer-mmodal .mod-desc-fill").html(marked.parse(prjInfo.body));
    });
    $.get(
      "https://api.modrinth.com/v2/project/" + modInfo.slug + "/version",
      (versList) => {
        $("#mod-viewer-mmodal .mod-version-selector-fill").append(
          "<option selected disabled>Выберите версию из списка</option>"
        );
        versList.forEach((versionItem) => {
          $("#mod-viewer-mmodal .mod-version-selector-fill").append(
            "<option value='" +
              versionItem.id +
              "' data-dlurl='" +
              versionItem.files[0].url +
              "'>" +
              versionItem.name +
              "</option>"
          );
        });
      }
    );
    $("#mod-viewer-mmodal .custom-button").unbind("click");
    $("#mod-viewer-mmodal .custom-button").click(() => {
      var mdlurl = $(
        "#mod-viewer-mmodal .mod-version-selector-fill option:selected"
      ).data("dlurl");
      var mdfn = FrogUtils.getFilenameFromURL(mdlurl);
      FrogUI.goHomeSection();
      FrogDownloadManager.downloadByURL(
        mdlurl,
        path.join(mainConfig.selectedBaseDirectory, "mods", mdfn),
        (status) => {
          if (status == true) {
            Toaster(
              "Мод успешно скачан<br><span class='mc-text'>" +
                FrogUtils.getFilenameFromURL(mdlurl) +
                "</span>",
              3500,
              false,
              "success"
            );
          } else {
            Toaster(
              "Ошибка при скачивании мода<br>" + status,
              5000,
              false,
              "error"
            );
          }
          FrogUI.changeBottomControlsStatus(true, false, false);
        }
      );
    });
  }

  static prevPage() {
    if (currentModsOffset - currentModsLimit >= 0) {
      currentModsOffset = currentModsOffset - currentModsLimit;
    } else if (
      currentModsOffset - currentModsLimit < 0 &&
      currentModsOffset > 0
    ) {
      currentModsOffset = 0;
    }
    this.refreshModsList(currentModsOffset);
  }

  static getFacets() {
    var resFacets = '[["project_type:mod"]';
    var curMlSelected = $("#mods-modloader-selector option:selected").val();
    var curVerSelected = $("#mods-version-selector option:selected").val();
    if (curMlSelected != "all" || curVerSelected != "all") {
      if (curMlSelected != "all") {
        resFacets = resFacets + ', ["categories:' + curMlSelected + '"]';
      }
      if (curVerSelected != "all") {
        resFacets = resFacets + ', ["versions:' + curVerSelected + '"]';
      }
    }
    resFacets = resFacets + "]";
    return resFacets;
  }

  static nextPage() {
    if (currentModsOffset + currentModsLimit < maxLimits) {
      currentModsOffset = currentModsOffset + currentModsLimit;
    }
    this.refreshModsList(currentModsOffset);
  }
}
