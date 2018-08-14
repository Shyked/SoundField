
class MoverKeyboard extends Mover {

  constructor(pos) {
    super();

    this._pos = {
      x: pos.x,
      y: pos.y,
      z: pos.z
    };

    this._vel = {
      x: 0,
      z: 0
    };

    this._keys = {
      left: false,
      up: false,
      right: false,
      down: false
    };

    this._looping = false;

    this._initEvents();
  };

  _initEvents() {
    this._registerEvent(
      window, 'keydown',
      this._keyHandler);
    this._registerEvent(
      window, 'keyup',
      this._keyHandler);
    this._registerEvent(
      window, 'touchstart',
      this._touchHandler);
    this._registerEvent(
      window, 'touchmove',
      this._touchHandler);
  };

  _keyHandler(e) {
    var enable = e.type == "keydown";
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        this._keys.left = enable;
        break;
      case "ArrowUp":
      case "KeyW":
        this._keys.up = enable;
        break;
      case "ArrowRight":
      case "KeyD":
        this._keys.right = enable;
        break;
      case "ArrowDown":
      case "KeyS":
        this._keys.down = enable;
        break;
    }
    this._startLoop();
  };

  _touchHandler(e) {
    this._vel.x = (e.touches[0].pageX - this._pos.x) / 10;
    this._vel.z = (e.touches[0].pageY - this._pos.z) / 10;
  };

  _loop() {
    this._vel.x = (this._vel.x + (this._keys.right ? 1 : 0) - (this._keys.left ? 1 : 0)) / 1.2;
    this._vel.z = (this._vel.z + (this._keys.down ? 1 : 0) - (this._keys.up ? 1 : 0)) / 1.2;

    if (Math.abs(this._vel.x) > 0.5 || Math.abs(this._vel.z) > 0.5) {
      this._pos.x += this._vel.x;
      this._pos.z += this._vel.z;
      this._trigger('move',
        this._pos.x,
        this._pos.z,
        window.utils.toAngleDist({ x: this._vel.x, y: this._vel.z }).angle);
      requestAnimationFrame(() => {
        this._loop();
      });
    }
    else this._looping = false;

  };

  _startLoop() {
    if (!this._looping) {
      this._looping = true;
      this._loop();
    }
  }

  reset(pos) {
    this._pos.x = pos.x;
    this._pos.z = pos.z;
    this._vel = { x: 0, z: 0 };
  };

  destroy() {
    this._trigger('destroy');
  };

};
