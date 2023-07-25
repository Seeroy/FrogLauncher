const NEWS_LOAD_URL = "http://froglauncher.seeroy.ru/news.json";
const NEWS_CARD_BASE =
  '<div class="news-item big animate__animated animate__fadeIn animate__fast" style="animation-delay: $5s"> <div class="news-icon">$4</div> <div class="news-caption">$1</div> <div class="news-description"> $2 </div> <div class="news-additional"> $3 </div> </div>';
const NEWS_RELOAD_INTERVAL = 1000 * 60 * 60; // every 1 hour
var newsRelInterval;

class FrogNewsProvider {
  static loadNews() {
    var newsDelayAnim = 0.6;
    $.get(NEWS_LOAD_URL, function (data) {
      data.forEach(function (item) {
        $("#news-place").append(
          NEWS_CARD_BASE.replaceAll(/\$1/gim, item.caption)
            .replaceAll(/\$2/gim, item.description)
            .replaceAll(/\$3/gim, item.additional).replaceAll(/\$4/gim, item.icon).replaceAll(/\$5/gim, newsDelayAnim)
        );
        newsDelayAnim = newsDelayAnim + 0.2;
      });
    }).fail(function () {
      $("#news-place").html(
        "<span class='text-white text-2xl mc-text'>Не удалось загрузить новости :(</span>"
      );
    });
  }

  static setNewsReloadInterval() {
    newsRelInterval = setInterval(() => {
      FrogNewsProvier.loadNews();
    }, NEWS_RELOAD_INTERVAL);
  }
}
