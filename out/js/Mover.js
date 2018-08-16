
class Mover extends EventHandler {

  constructor() {
    super();
    this._collisionMap = null;
  }

  attachCollisionMap(collisionMap) {
    this._collisionMap = collisionMap;
  }

  destroy() {
    this._trigger('destroy');
  };

};
