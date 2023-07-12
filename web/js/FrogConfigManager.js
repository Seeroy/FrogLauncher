class FrogConfigManager{
  static readMainConfig() {
    if(fs.existsSync("config.json")){
      return JSON.parse(fs.readFileSync("config.json"));
    } else {
      return false;
    }
  }

  static readMainConfig() {
    if(fs.existsSync("config.json")){
      return JSON.parse(fs.readFileSync("config.json"));
    } else {
      return false;
    }
  }
}