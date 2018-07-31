/*
  Used as a sound emitter.
  It emmits a specific sound at a specific place.
  Uses panner & convolver
  master: AudioNode where the sound is directed
  url:    URL where is located the sound to play
*/
var ObjectSound = function(master, url) {

  EventHandler.apply(this);

  this._id = 0;
  this._url = url;
  this._master = master;
  this._x = 0;
  this._z = 0;
  this._distance = 0;
  this._audioElement = null;
  this._audioSource = null;
  this._offline = false;

  this._panner = null;
  this._convolver = null;
  this._gain = null;
  this._convolverGain = null;

  this._init = function() {
    this._id = window.utils.generateUniqueId();

    this._offline = !!this._master.context.length;

    this._initAudioSource();

    this._panner = this._createPanner();
    this._convolver = this._createReverb();
    this._globalGain = this._createGain();
    this._convolverGain = this._createGain();

    this._connect();

    this._initEvents();
  };

  this._initAudioSource = function() {
    this._audioElement = document.createElement('audio');
    this._audioElement.src = this._url;
    this._audioElement.type = "audio/mpeg";
    this._audioElement.loop = true;
    this._audioSource = this._master.context.createMediaElementSource(this._audioElement);
  };

  this._initEvents = function() {
    this.on('distanceChanged', this._updateGains);
  };

  this._connect = function() {
    this._audioSource
      .connect(this._panner);

    this._audioSource
      .connect(this._convolver)
      .connect(this._convolverGain)
      .connect(this._panner);

    this._panner
      .connect(this._globalGain)
      .connect(this._master);
  };

  this._disconnect = function() {
    this._audioSource.disconnect();
    this._convolver.disconnect();
    this._convolverGain.disconnect();
    this._panner.disconnect();
    this._globalGain.disconnect();
  };

  this._createPanner = function() {
    var panner = this._master.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    return panner;
  };

  this._createReverb = function() {
    var convolver = this._master.context.createConvolver();
    convolver.buffer = ObjectSound.impulseResponse(this._master.context, 3, 20, false);
    return convolver;
  };

  this._createGain = function() {
    var gain = this._master.context.createGain();
    gain.gain = 0;
    return gain;
  };

  this._updateGains = function() {
    var that = this;
    var updateGains = function() {
      that._globalGain.gain.setValueAtTime(1 / (1 + that._distance * that._distance / 10000), that._master.context.currentTime);
      that._convolverGain.gain.setValueAtTime(Math.min(that._distance, 500) / 100, that._master.context.currentTime);
    };
    if (this._offline) updateGains();
    else {
      window.utils.cooldown(function() {
        updateGains();
      }, "reverb" + this._id, 200);
    }
  };

  this.getId = function() {
    return this._id;
  };

  this.play = function() {
    this._audioElement.play();
  };

  this.pause = function() {
    this._audioElement.pause();
  }

  this.stop = function() {
    this._audioElement.pause();
    this._audioElement.currentTime = 0;
  };

  this.setPosition = function(x, z) {
    this._x = x;
    this._z = z;
    this._panner.setPosition(x, 0.8, z);
  };

  this.updateDistanceFromListener = function(x, z) {
    this._distance = window.utils.distance({x: this._x, y: this._z}, {x: x, y: z});
    this._trigger('distanceChanged');
  };

  this.destroy = function() {
    this._trigger('destroy');
    this.stop();
    this._disconnect();
  };

  this._init();

};


ObjectSound.impulseResponse = function(audioContext, duration, decay, reverse) {
    var sampleRate = audioContext.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++) {
      var n = reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
};

// Override to return destination on Safari
AudioNode.prototype.connectBackup = AudioNode.prototype.connect;
AudioNode.prototype.connect = function(destination, outputIndex, inputIndex) {
  this.connectBackup(destination, outputIndex, inputIndex);
  return destination;
};
