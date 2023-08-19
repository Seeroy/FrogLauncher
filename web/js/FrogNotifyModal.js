const NOTIFY_MODAL_CODE =
  '<div class="notify-modal modal-bg" id="$5"> <div class="notify-window"> <div class="notify-icon">$4</div> <div class="notify-caption">$1</div> <div class="notify-description">$2</div> <button id="cmbtn-$5" class="custom-button w-full mt-4 text-white">$3</button> $6 </div> </div>';

class FrogNotifyModal {
  static create(caption, text, buttonText, icon, cb = () => {}, additionalElements = "") {
    var icon = getIconCode(icon);
    var randomID = "notify-" + Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
    $("body").append(
      NOTIFY_MODAL_CODE.replaceAll(/\$1/gim, caption)
        .replaceAll(/\$2/gim, text)
        .replaceAll(/\$3/gim, buttonText)
        .replaceAll(/\$4/gim, icon)
        .replaceAll(/\$5/gim, randomID)
        .replaceAll(/\$6/gim, additionalElements)
    );
    animateCSSJ("#" + randomID, "fadeIn", true);
    $("#cmbtn-" + randomID)
      .click(function () {
        animateCSSJ("#" + randomID, "fadeOut", true).then(() => {
          $(this).parent().parent().remove();
        });
        cb();
      });
  }
}
