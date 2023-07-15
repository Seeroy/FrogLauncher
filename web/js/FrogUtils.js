class FrogUtils {
  static fileExt(file) {
    return path.extname(file);
  }

  static getFilenameFromURL(url) {
    return url.split("/").splice(-1)[0];
  }

  static capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  static checkMatchArray(array, text) {
    var isMatches = false;
    array.forEach(function (status) {
      if (text.match(status) != null) {
        isMatches = true;
      }
    });
    return isMatches;
  }
}
