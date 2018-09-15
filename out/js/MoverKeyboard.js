
class MoverKeyboard extends Mover {

  constructor(listenerProps) {
    super();

    this._pos = {
      x: listenerProps.pos.x,
      y: listenerProps.pos.y,
      z: listenerProps.pos.z
    };
    this._radius = listenerProps.size / 2;

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

    this._speed = 0.02;

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

  _checkBounds() {
    if (this._pos.x < 0) this._pos.x = 0;
    if (this._pos.x > this._collisionMap.length - 1) this._pos.x = this._collisionMap.length - 1;
    if (this._pos.z < 0) this._pos.z = 0;
    if (this._pos.z > this._collisionMap[0].length - 1) this._pos.z = this._collisionMap[0].length - 1;
  }

  _moveWithCollision() {
    let roundX = Math.round(this._pos.x);
    let roundY = Math.round(this._pos.y);
    let roundZ = Math.round(this._pos.z);

    let orientationX = Math.sign(this._vel.x);
    let orientationZ = Math.sign(this._vel.z);
    let newX = this._pos.x + this._vel.x;
    let newZ = this._pos.z + this._vel.z;

    let changingX = () => { return orientationX * newX >= orientationX * roundX + (0.5 - this._radius) };
    let changingZ = () => { return orientationZ * newZ >= orientationZ * roundZ + (0.5 - this._radius) };

    let collideX = (bounce) => {
      newX = roundX + (0.49 - this._radius) * orientationX;
      if (bounce) this._vel.x = -this._vel.x / 1.5;
    };
    let collideZ = (bounce) => {
      newZ = roundZ + (0.49 - this._radius) * orientationZ;
      if (bounce) this._vel.z = -this._vel.z / 1.5;
    };

    if (changingX()) {
      if (this._collisionMap[roundX + orientationX][roundZ][roundY] & 2) collideX(true);
      else if (this._pos.y >= 1 && (this._collisionMap[roundX + orientationX][roundZ][roundY - 1] & 1) == 0) collideX();
    }

    if (changingZ()) {
      if (this._collisionMap[roundX][roundZ + orientationZ][roundY] & 2) collideZ(true);
      else if (this._pos.y >= 1 && (this._collisionMap[roundX][roundZ + orientationZ][roundY - 1] & 1) == 0) collideZ();
    }

    if (changingX() && changingZ()) {
      if (this._collisionMap[roundX + orientationX][roundZ + orientationZ][roundY] & 2) {
        // In angle, only collide with one direction (take the element to the nearest place)
        if (newX - roundX > newZ - roundZ) collideX(true);
        else collideZ(true);
      }
      else if (this._pos.y >= 1 && (this._collisionMap[roundX + orientationX][roundZ + orientationZ][roundY - 1] & 1) == 0) {
        if (newX - roundX > newZ - roundZ) collideX();
        else collideZ();
      }
    }

    this._pos.x = newX;
    this._pos.z = newZ;
  }

  _loop() {
    if (this._looping) {
      let tempVel = window.utils.toAngleDist({
        x: (this._keys.right ? this._speed : 0) - (this._keys.left ? this._speed : 0),
        y: (this._keys.down ? this._speed : 0) - (this._keys.up ? this._speed : 0)
      });
      if (tempVel.dist > this._speed) tempVel.dist = this._speed;
      tempVel.angle -= Math.PI / 4;
      tempVel = window.utils.toXY(tempVel);

      this._vel.x = (this._vel.x + tempVel.x) / 1.2;
      this._vel.z = (this._vel.z + tempVel.y) / 1.2;

      if (Math.abs(this._vel.x) + Math.abs(this._vel.z) > 0.001) {
        this._moveWithCollision();
        this._checkBounds();
        this._trigger('move',
          this._pos.x,
          this._pos.y,
          this._pos.z,
          window.utils.toAngleDist({ x: this._vel.x, y: this._vel.z }).angle);
        requestAnimationFrame(() => {
          this._loop();
        });
      }
      else {
        this._looping = false;
        this._trigger('stop');
      }
    }
  };

  _startLoop() {
    if (!this._looping) {
      this._trigger('moving');
      this._looping = true;
      this._loop();
    }
  }

  reset(pos) {
    this._pos.x = pos.x;
    this._pos.y = pos.y;
    this._pos.z = pos.z;
    this._vel = { x: 0, z: 0 };
  };

  destroy() {
    this._trigger('destroy');
    this._looping = false;
  };

};
