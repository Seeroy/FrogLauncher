const MOD_ITEM =
    '<div class="mod-item" data-displayed-id="$4"> <div class="mod-icon"><img src="$3"></div> <div class="mod-caption">$1</div> <div class="mod-description"> $2 </div> <div class="mod-stats"> <div class="badge"> <span class="material-symbols-rounded">download</span> <span class="ml-2">$5</span> </div> $6 </div> </div>';
const MOD_VIEWER_ICON = '<img class="mod-icon" src="$1">';
const MOD_VIEWER_GALLERY_ITEM =
    '<img src="$1" class="my-2" style="width: 50vw;">';
const MAX_DESC_LENGTH = 64;
const INSTALLED_MOD_ITEM =
    '<div class="item"> <div class="name flex items-center"><img src="$2" style="height: 32px;"><span class="ml-3">$1</span></div><button class="custom-button" onclick="FrogModsManager.deleteMod(' +
    "'$3'" +
    '); FrogModsUI.refreshInstalledList();">Удалить</button> </div>';
const MOD_ITEM_SKELETON =
    '<div class="mod-item"> <div class="mod-icon"> <div class="flex items-center justify-center w-full bg-gray-300 rounded dark:bg-gray-700 p-3"> <svg class="w-8 h-8 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18"> <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/> </svg> </div> </div> <div class="mod-caption"><div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48" style="margin-top: 0.28rem; margin-bottom: 0.28rem;"></div></div> <div class="mod-description"><div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px]" style="margin-top: 0.28rem; margin-bottom: 0.28rem;"></div></div> <div class="mod-stats"> <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-48" style="width: 280px; margin-top: 0.28rem; margin-bottom: 0.28rem;"></div> </div></div>';

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
        $("#packs-mmodal #modsList").html("");
        for (var i = 0; i < 16; i++) {
            $("#packs-mmodal #modsList").append(MOD_ITEM_SKELETON);
        }
        FrogModsManager.getMods(
            (mods) => {
                currentDisplayedMods = mods.hits;
                $("#packs-mmodal #modsList").html("");
                maxLimits = mods.total_hits;
                if (mods.hits.length == 0) {
                    $("#packs-mmodal #modsList").append(
                        "<span class='text-2xl' style='margin-top: 25vh'>Мы ничего не нашли ;(</span>"
                    );
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
            if (
                typeof mainConfig.installedModsCache !== "undefined" &&
                typeof mainConfig.installedModsCache[mod] !== "undefined"
            ) {
                $("#packs-mmodal #installedModsList").append(
                    INSTALLED_MOD_ITEM.replaceAll(
                        /\$1/gim,
                        mainConfig.installedModsCache[mod].name +
                        " (" +
                        mainConfig.installedModsCache[mod].version + ")"
                    )
                        .replaceAll(/\$2/gim, mainConfig.installedModsCache[mod].icon)
                        .replaceAll(/\$3/gim, mod)
                );
            } else {
                $("#packs-mmodal #installedModsList").append(
                    INSTALLED_MOD_ITEM.replaceAll(/\$1/gim, mod)
                        .replaceAll(/\$2/gim, "")
                        .replaceAll(/\$3/gim, mod)
                );
            }
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
        $("#mod-viewer-mmodal .mod-version-selector-fill").html("");
        $.get("https://api.modrinth.com/v2/project/" + modInfo.slug, (prjInfo) => {
            $("#mod-viewer-mmodal .mod-desc-fill").html(marked.parse(prjInfo.body));
        });
        $.get(
            "https://api.modrinth.com/v2/project/" + modInfo.slug + "/version",
            (versList) => {
                versList.forEach((verItem) => {
                    $("#mod-viewer-mmodal .mods-list-v2").append("<div class='item' data-version='" + verItem.name + "' data-dlurl='" + verItem.files[0].url + "'><button type='button' class='custom-button text-white ml-3 dl-button'><span class='material-symbols-rounded mt-1 w-10'>download</span></button><span class='name'>" + verItem.name + "</span><span class='loader'>" + verItem.loaders.join(", ") + "</span><span class='version'>" + verItem.game_versions.join(", ") + "</span></div>");
                });
                $("#mod-viewer-mmodal .custom-button").unbind("click");
                $("#mod-viewer-mmodal .mods-list-v2 .item .dl-button").click(function () {
                    var mdlurl = $(this).parent().data("dlurl");
                    var mdlver = $(this).parent().data("version");
                    console.log(mdlver);
                    var mdfn = FrogUtils.getFilenameFromURL(mdlurl);
                    if (typeof mainConfig.installedModsCache === "undefined") {
                        mainConfig.installedModsCache = {};
                    }
                    if (typeof mainConfig.installedModsCache[mdfn] === "undefined") {
                        mainConfig.installedModsCache[mdfn] = {
                            name: $("#mod-viewer-mmodal .mod-name-fill").eq(0).text(),
                            version: mdlver,
                            icon: $("#mod-viewer-mmodal .mod-icon-fill .mod-icon").attr("src"),
                        };
                        FrogConfigManager.writeMainConfig(mainConfig);
                    }
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
