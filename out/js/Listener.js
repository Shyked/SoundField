
var Listener = function(audioContext, skin) {

  EventHandler.apply(this);

  this._x = 0;
  this._z = 0;
  this._display = null;
  this._listener = null;

  this._init = function() {
    if (ObjectDisplay) this._display = new ObjectDisplay(skin);
    this._listener = audioContext.listener;
  };

  this.getPosition = function() {
    return {x: this._x, z: this._z};
  };

  this.setPosition = function(x, z) {
    this._x = x;
    this._z = z;
    if (this._display) this._display.setPosition(x, z);
    this._listener.setPosition(window.utils.roundToDecimal(x, 5), 0, window.utils.roundToDecimal(z, 5));
  };

  this.setPositionRelative = function(dx, dz) {
    this.setPosition(this._x + dx, this._z + dz);
  };

  this.setOrientation = function(x, z) {
    if (typeof z == 'undefined') {
      var angle = x;
      var pos = window.utils.toXY({ angle: angle, dist: 1 });
      x = pos.x;
      z = pos.y;
    }
    x = window.utils.roundToDecimal(x, 5);
    z = window.utils.roundToDecimal(z, 5);
    this._listener.setOrientation(x, 0, z, 0, 1, 0);
    if (this._display) this._display.setOrientation(x, z);
  };

  this.destroy = function() {
    this._trigger('destroy');
    this._display.destroy();
  };

  this._init();

};
