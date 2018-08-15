
class ObjectDisplay extends EventHandler {

  constructor(skin, shadow) {
    super();
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._skin = skin;
    this._shadow = shadow;
    this._container = null;
    this._img = null;
    this._shadowMask = null;
    this.filteredImg = null;
    this._loadSkin();
  };

  async _loadSkin() {
    let imgToLoad = [this._skin];
    if (this._shadow) imgToLoad.push(this._shadow);
    let res = await ImgLoader(imgToLoad);
    this._img = res[0];
    if (res[1]) this._shadowMask = res[1];
    else this._shadowMask = null;
  }

  get img() {
    return this._img;
  }

  get shadowMask() {
    return this._shadowMask;
  }

  getPosition() {
    return { x: this._x, y: this._y, z: this._z };
  }

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  };

  setOrientation(x, y, z) {
    
  };

  destroy() {
    this._trigger('destroy');
  };

};
