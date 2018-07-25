
var ObjectDisplay = function(shape) {

  EventHandler.apply(this);

  this._x = 0;
  this._z = 0;
  this._shape = shape;
  this._container = null;

  this._init = function() {
    this._container = document.createElement("div");
    this._container.className = "object";
    this._container.innerHTML = ObjectDisplay.shapes[this._shape];
    document.getElementById("board").appendChild(this._container);
  };

  this.setPosition = function(x, z) {
    this._x = x;
    this._z = z;
    this._container.style.left = x + "px";
    this._container.style.top = z + "px";
  };

  this.setOrientation = function(x, z) {
    var angleDist = window.utils.toAngleDist({x: x, y: z});
    this._container.style.transform = "rotate(" + (angleDist.angle + Math.PI / 2) + "rad)";
  };

  this.destroy = function() {
    this._trigger('destroy');
    this._container.parentElement.removeChild(this._container);
  };

  this._init();

};

ObjectDisplay.shapes = {
  source: "<div class='source'><div class='direction'></div></div>",
  listener: "<div class='listener'><div class='direction'></div></div>"
};
