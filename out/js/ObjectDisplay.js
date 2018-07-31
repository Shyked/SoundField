
var ObjectDisplay = function(shape) {

  EventHandler.apply(this);

  this._x = 0;
  this._z = 0;
  this._shape = shape;
  this._container = null;

  this._init = function() {
    
  };

  this.setPosition = function(x, z) {
    this._x = x;
    this._z = z;
  };

  this.setOrientation = function(x, z) {
    
  };

  this.destroy = function() {
    this._trigger('destroy');
  };

  this._init();

};
