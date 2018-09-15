
class ObjectDisplay extends EventHandler {

  constructor(skin, shadow) {
    super();
    this._id = window.utils.generateUniqueId();
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._skinUrl = skin;
    this._shadowMaskUrl = shadow;
    this._skinImg = null;
    this._shadowMaskImg = null;

    this._filteredImg = null;
    
    this._spriteCache = [];
    this._spriteShadowCache = [];
    this._isSprite = /\.sprite\.\w+$/.test(this._skinUrl);
    this._spritePropsUrl = this._isSprite
      ? this._skinUrl.replace(/\.\w+$/, ".json")
      : null;
    this._spriteProps = null;
    this._spriteFrameId = 0;
    this._spriteSequence = 0;
    this._spriteAnimated = false;
    this._spriteSequenceInterval = null;

    this._loadSkin();
  };

  get id() {
    return this._id;
  }

  async _loadSkin() {
    let imgToLoad = [this._skinUrl];
    if (this._shadowMaskUrl) imgToLoad.push(this._shadowMaskUrl);

    let promises = [];
    promises.push(ImgLoader(imgToLoad));
    if (this._isSprite) promises.push(JsonLoader(this._spritePropsUrl));
    let [imgRes, jsonRes] = await Promise.all(promises);

    this._skinImg = imgRes[0];
    if (imgRes[1]) this._shadowMaskImg = imgRes[1];
    else this._shadowMaskImg = null;

    if (jsonRes) {
      this._spriteProps = jsonRes;
      this._initSprite();
    }

    console.log("Skin loaded : " + this._skinUrl);
  }

  get img() {
    if (this._skinImg == null)
      return null;
    else if (this._isSprite)
      return this.currentSprite;
    else
      return this._skinImg;
  }

  get shadowMask() {
    if (this._shadowMaskImg == null)
      return null;
    else if (this._isSprite)
      return this.currentShadowMask;
    else
      return this._shadowMaskImg;
  }

  get filteredImg() {
    if (this._filteredImg == null)
      return null;
    else if (this._isSprite) {
      if (this._filteredImg[this._spriteSequence] == null) return null;
      else return this._filteredImg[this._spriteSequence][this.spriteFrame];
    }
    else
      return this._filteredImg;
  }

  set filteredImg(value) {
    if (this._isSprite) {
      if (!this._filteredImg) this._filteredImg = [];
      if (!this._filteredImg[this._spriteSequence]) this._filteredImg[this._spriteSequence] = [];
      this._filteredImg[this._spriteSequence][this.spriteFrame] = value;
    }
    else this._filteredImg = value;
  }

  getPosition() {
    return { x: this._x, y: this._y, z: this._z };
  }

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
  };

  setOrientation(angle) {
    if (this.isSprite) {
      if (angle > 7 * Math.PI / 8) this._spriteSequence = 0;
      else if (angle > 5 * Math.PI / 8) this._spriteSequence = 1;
      else if (angle > 3 * Math.PI / 8) this._spriteSequence = 2;
      else if (angle > 1 * Math.PI / 8) this._spriteSequence = 3;
      else if (angle > -1 * Math.PI / 8) this._spriteSequence = 4;
      else if (angle > -3 * Math.PI / 8) this._spriteSequence = 5;
      else if (angle > -5 * Math.PI / 8) this._spriteSequence = 6;
      else if (angle > -7 * Math.PI / 8) this._spriteSequence = 7;
      else if (angle <= -7 * Math.PI / 8) this._spriteSequence = 0;
    }
  };

  /* SPRITE */

  _initSprite() {
    let heightCount = this._skinImg.height / this._spriteProps.height;
    this._sequenceInterval = setInterval(() => {
      if (this._spriteAnimated)
        this._spriteFrameId = (this._spriteFrameId + 1) % this._spriteProps.animations[this._spriteSequence].length;
    }, 1000 / this._spriteProps.frameRate);
  }

  get isSprite() {
    return this._isSprite;
  }

  get currentSprite() {
    return this._getSpriteFor(this._spriteCache);
  }

  get currentShadowMask() {
    return this._getSpriteFor(this._spriteShadowCache);
  }

  get spriteFrame() {
    if (this._spriteAnimated) return this._spriteProps.animations[this._spriteSequence][this._spriteFrameId];
    else return 0;
  }

  _getSpriteFor(cache) {
    if (!cache[this._spriteSequence])
      cache[this._spriteSequence] = [];

    if (!cache[this._spriteSequence][this.spriteFrame]) {
      let canvas = document.createElement('canvas');
      canvas.width = this._spriteProps.width;
      canvas.height = this._spriteProps.height;
      let context = canvas.getContext('2d');
      context.drawImage(this._skinImg,
        this._spriteSequence * canvas.width, this.spriteFrame * canvas.height,
        canvas.width, canvas.height,
        0, 0,
        canvas.width, canvas.height);
      cache[this._spriteSequence][this.spriteFrame] = canvas;
    }

    return cache[this._spriteSequence][this.spriteFrame];
  }

  startAnimation() {
    if (this._isSprite) {
      this._spriteAnimated = true;
      this._spriteFrameId = 0;
    }
  }

  stopAnimation() {
    if (this._isSprite) {
      this._spriteAnimated = false;
    }
  }


  destroy() {
    clearInterval(this._sequenceInterval);
    this._trigger('destroy');
  };

};
