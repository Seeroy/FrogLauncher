const SERVERS_LIST_URL = "http://froglauncher.seeroy.ru/servers.json";
const SERVERS_LIST_ITEM_BASE =
  '<div class="server-item"> <div class="server-icon"> <img src="$5"> </div> <div class="server-name">$1</div> <div class="server-description">$2</div> <div class="server-version"> <span class="material-symbols-rounded" style="font-size: 10pt" >conversion_path</span > <span class="ml-3">$3</span> </div> <div class="server-ip"> <span class="material-symbols-rounded" style="font-size: 10pt" >dns</span > <span class="ml-3">$4</span> </div> <div class="server-copy-btn"> <span class="material-symbols-rounded">content_copy</span> </div> </div>';
const SERVERS_LIST_ITEM_BASE_V2 =
  '<div class="server-item-v2 flex items-center"> <img src="$5" /> <div class="flex flex-col justify-center mx-3 grow"> <span class="caption">$1</span> <span class="description">$2</span> </div> <div class="flex flex-col justify-center mx-3"> <span class="version"> <span class="material-symbols-rounded" style="font-size: 10pt" >conversion_path</span > <span class="ml-3">$3</span> </span> <span class="ip"> <span class="material-symbols-rounded" style="font-size: 10pt" >dns</span > <span class="ml-3">$4</span> </span> </div> <div class="flex items-center justify-center copy-btn"> <span class="material-symbols-rounded" onclick="FrogServersUI.copyServerIP(`$6`)" >content_copy</span > </div> <div class="flex items-center justify-center play-btn"> <span class="material-symbols-rounded" style="font-size: 26pt;" onclick="FrogServersUI.playOnServer(`$6`, `$7`)" >play_arrow</span > </div> </div>';

class FrogServersUI {
  static getServersList(cb) {
    $.get(SERVERS_LIST_URL, (srv) => {
      cb(srv.servers);
    });
  }

  static getLastUpdateID(cb) {
    $.get(SERVERS_LIST_URL, (srv) => {
      cb(srv.updateID);
    });
  }

  static onLauncherStart(cb) {
    $.get(SERVERS_LIST_URL, (data) => {
      serversListSave = data;
      FrogServersUI.refreshServerNewNotification();
      cb();
    });
  }

  static loadServersList() {
    $("#servers-mmodal #serversList").html("");
    serversListSave.servers.forEach((srv) => {
      $("#servers-mmodal #serversList").append(
        SERVERS_LIST_ITEM_BASE_V2.replaceAll(/\$1/gim, srv.name)
          .replaceAll(/\$2/gim, srv.description)
          .replaceAll(/\$3/gim, srv.version)
          .replaceAll(/\$4/gim, srv.ip)
          .replaceAll(/\$5/gim, srv.icon)
          .replaceAll(/\$6/gim, srv.ip + ":" + srv.port)
          .replaceAll(/\$7/gim, srv.flVersion)
      );
    });
  }

  static serversListViewed() {
    localStorage.setItem("lvsid", serversListSave.updateId);
    $("#new-servers-badge").addClass("hidden");
  }

  static refreshServerNewNotification() {
    if (
      localStorage.lvsid == null ||
      localStorage.lvsid < serversListSave.updateId
    ) {
      $("#new-servers-badge").removeClass("hidden");
    } else {
      $("#new-servers-badge").addClass("hidden");
    }
  }

  static copyServerIP(ip) {
    clipboard.writeText(ip);
    Toaster("IP скопирован!", 1500, false, "success");
  }

  static playOnServer(ipWithPort, serverRequiredVersion) {
    selectedServerFromList = ipWithPort;
    FrogVersionsUI.changeActiveVersion(serverRequiredVersion);
    FrogStartManager.startSelectedVersion();
    FrogUI.goHomeSection();
  }
}
