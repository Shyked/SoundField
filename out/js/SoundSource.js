
var SoundSource = function(master, sound, skin) {

  EventHandler.apply(this);
  Displayable.apply(this);

  this._sound = null;

  this._init = function() {
    this.setDisplay(skin);
    this._sound = new ObjectSound(master, sound);
  };

  this.play = function() {
    this._sound.play();
  };

  this.stop = function() {
    this._sound.stop();
  };  

  this.setPosition = function(x, z) {
    this._sound.setPosition(x, z);
    this._trigger('position', x, z);
  };

  this.updateDistanceFromListener = function(x, z) {
    this._sound.updateDistanceFromListener(x, z);
  };

  this.destroy = function() {
    this._trigger('destroy');
    this._sound.destroy();
  };

  this._init();

};
