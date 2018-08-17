
class Camera extends EventHandler {

  constructor() {
    super();

    this._pos = { x: 0, y: 0, z: 0 };

    this._centerMargin = 0.5;

    this._following = null;
    
    this._looping = false;
  };

  follow(display) {
    this._following = display;
    let pos = this._following.getPosition();
    this._pos.x = pos.x;
    this._pos.y = pos.y;
    this._pos.z = pos.z;
    this._startLoop();
  }

  release() {
    this._following = null;
    this._looping = false;
  }

  _startLoop() {
    this._looping = true;
    this._loop();
  }

  _loop() {
    if (this._looping) {

      let pos = this._following.getPosition();

      let delta = {
        x: pos.x - this._pos.x,
        y: pos.y - this._pos.y,
        z: pos.z - this._pos.z
      };

      delta.x = (Math.max(Math.abs(delta.x) - this._centerMargin, 0)) * Math.sign(delta.x) / 20;
      delta.y = (Math.max(Math.abs(delta.y) - this._centerMargin, 0)) * Math.sign(delta.y) / 20;
      delta.z = (Math.max(Math.abs(delta.z) - this._centerMargin, 0)) * Math.sign(delta.z) / 20;

      this._pos.x += delta.x;
      this._pos.y += delta.y;
      this._pos.z += delta.z;

      this._trigger('move', this._pos.x, this._pos.y + 1, this._pos.z);

      requestAnimationFrame(() => { this._loop(); });
    }
  }

  destroy() {
    this._looping = false;
    this._trigger('destroy');
  };

};
