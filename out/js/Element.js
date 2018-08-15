
class Element extends EventHandler {

  constructor(master, sound, skin, shadow, options) {
    super();
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._display = skin ? new ObjectDisplay(skin, shadow) : null;
    this._sound = sound ? new ObjectSound(master, sound) : null;
    this.options = options;
  };

  /* DISPLAY */

  getDisplay() {
    return this._display;
  };

  /* SOUND */

  play() {
    if (this._sound) this._sound.play();
  };

  stop() {
    if (this._sound) this._sound.stop();
  };

  /* COMMON */

  getPosition() {
    return {
      x: this._x,
      y: this._y,
      z: this._z
    };
  }

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    if (this._sound) this._sound.setPosition(x, y, z);
    if (this._display) this._display.setPosition(x, y, z);
  };

  updateDistanceFromListener(x, y, z) {
    this._sound.updateDistanceFromListener(x, y, z);
  };

  destroy() {
    this._trigger('destroy');
    this._sound.destroy();
  };

};
