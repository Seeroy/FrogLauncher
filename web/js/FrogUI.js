class FrogUI {
  static loadSection = function(selector, section) {
    $.get("sections/" + section + ".html", function(sectionCode){
      $(selector).append(sectionCode);
    });
  }

  static addSectionIntoBody = function(section) {
    $.get("sections/" + section + ".html", function(sectionCode){
      $(".window-frame").append(sectionCode);
    });
  }

  static showPreloader = function(text = ""){
    if(text != ""){
      $(".preloader-container .preloader-desc").text(text);
    }
    $(".preloader-container").removeClass("hidden");
    animateCSS(".preloader-container", "fadeIn", true);
  }

  static hidePreloader = function(){
    animateCSS(".preloader-container", "fadeOut", true).then(() => {
      $(".preloader-container").addClass("hidden");
    });
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