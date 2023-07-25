const MODRINTH_MODS_API_URL = "https://api.modrinth.com/v2/search?";

class FrogModsManager {
  static getMods(
    cb,
    query = "",
    offset = 0,
    limit = 16,
    sort = "downloads",
    facets = ""
  ) {
    var fullUrl = MODRINTH_MODS_API_URL;
    var urlAddons = "";
    var params = {
      query: query,
      offset: offset,
      limit: limit,
      index: sort,
      facets: encodeURIComponent(facets)
    }
    query == "" && delete params.query;
    offset == "" && delete params.offset;
    limit == "" && delete params.limit;
    sort == "" && delete params.index;
    facets == "" && delete params.facets;
    if (query != "") {
      urlAddons = "query=" + query;
    }
    urlAddons = encodeGetParams(params);
    fullUrl = fullUrl + urlAddons;
    $.get(fullUrl, function(data){
      cb(data);
    });
  }

  static getInstalledMods(){
    return fs.readdirSync(path.join(mainConfig.selectedBaseDirectory, "mods"));
  }

  static deleteMod(modName){
    var modPath = path.join(mainConfig.selectedBaseDirectory, "mods", modName);
    if(fs.existsSync(modPath)){
      fs.unlinkSync(modPath);
      return true;
    } else {
      return false;
    }
  }
}

const encodeGetParams = p => 
  Object.entries(p).map(kv => kv.map(encodeURIComponent).join("=")).join("&");