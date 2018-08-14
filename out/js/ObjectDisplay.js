
class ObjectDisplay extends EventHandler {

  constructor(skin) {
    super();
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._skin = skin;
    this._container = null;
    this._img = null;
    this._loadSkin();
  };

  async _loadSkin() {
    let res = await ImgLoader({ graphics: [this._skin] });
    this._img = res.files[Object.keys(res.files)[0]];
  }

  get img() {
    return this._img;
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
