/*
  Handles the whole stage containing elements, field, listener etc
*/
class Stage extends EventHandler {

  constructor(mapName) {
    super();
    this._mapProps = null;
    this._preCalculatedMap = null;
    this._elements = [];
    this._master = null;
    this._mover = null;
    this._camera = null;
    this._listener = null;
    this._drawing = true;
    this._frameInterval = 0;

    this.setFps(60);

    this._loadMap(mapName);

    this._initEvents();
  }

  _initEvents() {
  };

  async _loadMap(mapName) {
    this._mapProps = await MapLoader.load(mapName);
    Drawer.setMap(this._mapProps);
    this._mover = new MoverKeyboard(this._mapProps.listener);
    this._mover.on('move', (x, y, z, angle) => {
      this._updateListenerPosition(x, y, z, angle);
    });
    this._mover.on('moving', () => { this._listener.moving(); })
    this._mover.on('stop', () => { this._listener.stop(); })
    this._camera = new Camera();
    this._camera.on('move', (x, y, z) => {
      Drawer.moveCamera(x, y, z);
    });
    this.buildRealTime();
    this._draw();
  }

  _initListener() {
    this._listener = new Listener(this._master.context, this._mapProps.listener.skin);
    this._listener.setPosition(this._mapProps.listener.pos.x, this._mapProps.listener.pos.y, this._mapProps.listener.pos.z);
    this._preCalculatedMap.addDynamicDisplay(this._listener.getDisplay());
  };

  _build() {
    for (let i in this._mapProps.elements) {
      this._addElement(this._mapProps.elements[i]);
    }
    this._preCalculatedMap = new PreCalculatedMap(this._mapProps.layout, this._mapProps.tilesCollisions, this._elements);
    this._mover.attachCollisionMap(this._preCalculatedMap.tilesCollisionMap);
    this._mover.reset(this._mapProps.listener.pos);
    this._initListener();
    this._camera.follow(this._listener.getDisplay());
    this._trigger('built');
  };

  _addElement(elementJson) {
    let element = new Element(this._master, elementJson.sound, elementJson.skin, elementJson.shadow, elementJson.options);
    element.setPosition(elementJson.pos.x, elementJson.pos.y, elementJson.pos.z);
    this._elements.push(element);
  };

  _purge() {
    this._camera.release();
    for (let i in this._elements) {
      this._elements[i].destroy();
    }
    this._elements = [];
    if (this._listener) {
      this._listener.destroy();
      this._listener = null;
    }
  };

  _updateListenerPosition(x, y, z, angle) {
    this._listener.setPosition(x, y, z);
    this._listener.setOrientation(angle);
    this._preCalculatedMap.updateDynamicDisplay(this._listener.getDisplay());
    this._updateDistanceFromListener(x, y, z);
  };

  _updateDistanceFromListener(x, y, z) {
    for (var i in this._elements) {
      this._elements[i].updateDistanceFromListener(x, y, z);
    }
  };

  _initMaster(audioContext) {
    if (this._master) this._master.disconnect();
    this._master = audioContext.createGain();
    this._master.gain.setValueAtTime(1, audioContext.currentTime);
    this._master.connect(audioContext.destination);
    return this._master;
  };

  _draw() {
    Drawer.draw(this._preCalculatedMap.elementsMap, this._preCalculatedMap.dynamicDisplays);
    if (this._drawing) {
      var that = this;
      if (this._frameInterval < 17) {
        requestAnimationFrame(function() {
          that._draw();
        });
      }
      else {
        setTimeout(function() {
          that._draw();
        }, this._frameInterval);
      }
    }
  };

  setFps(fps) {
    this._frameInterval = 1000 / fps;
  }

  buildRealTime() {
    this._purge();
    this._initMaster(window.AUDIO_CONTEXT);
    this._build();
  };

  buildOffline(duration) {
    if (!duration) duration = 30;
    this._purge();
    let offlineAudioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, AUDIO_CONTEXT.sampleRate * duration, AUDIO_CONTEXT.sampleRate);
    this._initMaster(offlineAudioContext);
    this._build();
  };

  play() {
    let listenerPos = this._listener.getDisplay().getPosition();
    for (let i in this._elements) {
      this._elements[i].play();
      this._elements[i].updateDistanceFromListener(listenerPos.x, listenerPos.y, listenerPos.z);
    }
  };

  stop() {
    for (let i in this._elements) {
      this._elements[i].stop();
    }
  };

  record() {
    this.buildOffline();
    let recorder = new Recorder(this._master);
    recorder.on('finish', function(url) {
      console.log(url);
    });
    this._master.context.oncomplete = function() {
      recorder.finish();
    };
    recorder.record();
    this._master.context.startRendering().then(function(renderedBuffer) {
      // Code below will redirect generated sound to the real time context upon completion
      // var audioResult = AUDIO_CONTEXT.createBufferSource();
      // audioResult.buffer = renderedBuffer;
      // audioResult.connect(AUDIO_CONTEXT.destination);
      // audioResult.start();
    });
    this.play();
  };

  destroy() {
    this._drawing = false;
    this._trigger('destroy');
    this._purge();
  };

};
