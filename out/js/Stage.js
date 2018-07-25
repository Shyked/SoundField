
var Stage = function(soundSourcesJson, listenerJson) {

  EventHandler.apply(this);

  this._soundSourcesJson = [];
  this._listenerJson = [];
  this._soundSources = [];
  this._master = null;
  this._mover = null;
  this._listener = null;

  this._init = function() {
    this._soundSourcesJson = soundSourcesJson;
    this._listenerJson = listenerJson;

    this._mover = new MoverKeyboard(listenerJson.pos);

    this.buildRealTime();

    this._initEvents();
  };

  this._initEvents = function() {
    var that = this;
    this._mover.on('move', function(x, z, angle) {
      that._updateListenerPosition(x, z, angle);
    })
  };

  this._initListener = function() {
    this._listener = new Listener(this._master.context, this._listenerJson.skin);
    this._listener.setPosition(this._listenerJson.pos.x, this._listenerJson.pos.z);
  };

  this._build = function() {
    for (var i in soundSourcesJson) {
      var soundSource = new SoundSource(this._master, soundSourcesJson[i].sound, soundSourcesJson[i].skin);
      soundSource.setPosition(soundSourcesJson[i].pos.x, soundSourcesJson[i].pos.z);
      this._soundSources.push(soundSource);
    }
    this._mover.reset(this._listenerJson.pos);
    this._initListener();
  };

  this._purge = function() {
    for (var i in this._soundSources) {
      this._soundSources[i].destroy();
    }
    this._soundSources = [];
    if (this._listener) {
      this._listener.destroy();
      this._listener = null;
    }
  };

  this._updateListenerPosition = function(x, z, angle) {
    this._listener.setPosition(x, z);
    this._listener.setOrientation(angle);
    this._updateDistanceFromListener(x, z);
  };

  this._updateDistanceFromListener = function(x, z) {
    for (var i in this._soundSources) {
      this._soundSources[i].updateDistanceFromListener(x, z);
    }
  };

  this._initMaster = function(audioContext) {
    if (this._master) this._master.disconnect();
    this._master = audioContext.createGain();
    this._master.gain.setValueAtTime(1, audioContext.currentTime);
    this._master.connect(audioContext.destination);
    return this._master;
  };

  this.buildRealTime = function() {
    this._purge();
    this._initMaster(window.AUDIO_CONTEXT);
    this._build();
  };

  this.buildOffline = function(duration) {
    if (!duration) duration = 30;
    this._purge();
    var offlineAudioContext = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, AUDIO_CONTEXT.sampleRate * duration, AUDIO_CONTEXT.sampleRate);
    this._initMaster(offlineAudioContext);
    this._build();
  };

  this.play = function() {
    for (var i in this._soundSources) {
      this._soundSources[i].play();
    }
  };

  this.stop = function() {
    for (var i in this._soundSources) {
      this._soundSources[i].stop();
    }
  };

  this.record = function() {
    this.buildOffline();
    var recorder = new Recorder(this._master);
    recorder.on('finish', function(url) {
      console.log(url);
    });
    this._master.context.oncomplete = function() {
      recorder.finish();
    };
    recorder.record();
    this._master.context.startRendering().then(function(renderedBuffer) {
      // var audioResult = AUDIO_CONTEXT.createBufferSource();
      // audioResult.buffer = renderedBuffer;
      // audioResult.connect(AUDIO_CONTEXT.destination);
      // audioResult.start();
    });
    this.play();
  };

  this.destroy = function() {
    this._trigger('destroy');
  };

  this._init();

};
