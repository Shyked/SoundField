/*
  Handles the position of the listener.
  audioContext:   In which audioContext the Listener is located
  skin:           Displayed skin
*/
class Listener extends EventHandler {

  constructor(audioContext, skin) {
    super();
    this._x = 0;
    this._y = 0;
    this._z = 0;
    
    this._display = skin ? new ObjectDisplay(skin) : null;
    this._listener = audioContext.listener;
  };

  getPosition() {
    return {x: this._x, y: this._y, z: this._z};
  };

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    if (this._display) this._display.setPosition(x, y, z);
    this._listener.setPosition(
      window.utils.roundToDecimal(x, 5),
      window.utils.roundToDecimal(y, 5),
      window.utils.roundToDecimal(z, 5));
  };

  getDisplay() {
    return this._display;
  };

  setPositionRelative(dx, dy, dz) {
    this.setPosition(this._x + dx, this._y + dy, this._z + dz);
  };

  setOrientation(x, y, z) {
    if (typeof y == 'undefined') {
      var angle = x;
      var pos = window.utils.toXY({ angle: angle, dist: 1 });
      x = pos.x;
      y = 0;
      z = pos.y;
    }
    x = window.utils.roundToDecimal(x, 5);
    y = window.utils.roundToDecimal(y, 5);
    z = window.utils.roundToDecimal(z, 5);
    this._listener.setOrientation(x, y, z, 0, 1, 0);
    if (this._display) this._display.setOrientation(x, y, z);
  };

  destroy() {
    this._trigger('destroy');
    this._display.destroy();
  };

};
