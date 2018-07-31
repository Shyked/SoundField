
var Displayable = function() {

  EventHandler.apply(this);

  this._display = null;

  this._init = function() {
    this._initEvents();
  };

  this._initEvents = function() {
    this.on('destroy', function() {
      this._display.destroy();
    });
    this.on('position', function(x, z) {
      this._display.setPosition(x, z);
    });
  };

  this.setDisplay = function(shape) {
    this._display = new ObjectDisplay(shape);
  };

  this.getDisplay = function() {
    return this._display;
  };

  this._init();

};
