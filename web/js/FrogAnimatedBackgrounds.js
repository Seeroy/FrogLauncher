var currentAnimationObject;

class FrogAnimatedBackgrounds {
  static startAnimationByName(name) {
    switch (name) {
      case "b":
        this.startBirds();
        break;
      case "w":
        this.startWaves();
        break;
      case "c":
        this.startClouds();
        break;
      case "d":
        this.startDots();
        break;
      case "h":
        this.startHalo();
        break;
    }
  }

  static startBirds() {
    currentAnimationObject = VANTA.BIRDS({
      el: ".main-bg",
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      backgroundColor: this.getMainBackgroundColor(),
    });
  }

  static startWaves() {
    currentAnimationObject = VANTA.WAVES({
      el: ".main-bg",
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: this.getMainBackgroundColor(),
    });
  }

  static startClouds() {
    currentAnimationObject = VANTA.CLOUDS({
      el: ".main-bg",
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      skyColor: this.getMainBackgroundColor(),
      cloudColor: 0x6c6c7a,
    });
  }

  static startHalo() {
    currentAnimationObject = VANTA.HALO({
      el: ".main-bg",
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      backgroundColor: this.getMainBackgroundColor(),
      amplitudeFactor: 2.0,
      size: 1.4,
    });
  }

  static startDots() {
    currentAnimationObject = VANTA.DOTS({
      el: ".main-bg",
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      backgroundColor: this.getMainBackgroundColor(),
      color: this.getMainPrimaryColor(),
      color2: this.getMainPrimaryColor(),
      size: 7.5,
      showLines: false,
    });
  }

  static stopBackground() {
    if(typeof currentAnimationObject !== "undefined") {
      currentAnimationObject.destroy();
    }
    $(".main-bg").remove();
    $(".window-frame").append('<div class="main-bg"></div>');
  }

  static getMainBackgroundColor() {
    var clr = getComputedStyle(document.documentElement).getPropertyValue(
      "--bg-primary-anim"
    );
    return new THREE.Color(clr);
  }

  static getMainPrimaryColor() {
    var clr = getComputedStyle(document.documentElement).getPropertyValue(
      "--bg-primary-400"
    );
    return new THREE.Color(clr);
  }
}
