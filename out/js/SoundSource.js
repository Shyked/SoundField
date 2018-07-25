
var SoundSource = function(master, sound, skin) {

  EventHandler.apply(this);

  this._display = null;
  this._sound = null;

  this._init = function() {
    if (ObjectDisplay) this._display = new ObjectDisplay(skin);
    this._sound = new ObjectSound(master, sound);
  };

  this.play = function() {
    this._sound.play();
  };

  this.stop = function() {
    this._sound.stop();
  };  

  this.setPosition = function(x, y) {
    if (this._display) this._display.setPosition(x, y);
    this._sound.setPosition(x, y);
  };

  this.updateDistanceFromListener = function(x, z) {
    this._sound.updateDistanceFromListener(x, z);
  };

  this.destroy = function() {
    this._trigger('destroy');
    this._display.destroy();
    this._sound.destroy();
  };

  this._init();

};
