/*
  Used as a sound emitter.
  It emmits a specific sound at a specific place.
  Uses panner & convolver
  master: AudioNode where the sound is directed
  url:    URL where is located the sound to play
*/
class ObjectSound extends EventHandler {

  constructor(master, url, scope) {
    super();

    this._id = window.utils.generateUniqueId();
    this._url = url;
    this._master = master;
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this._distance = 0;
    this._scope = scope || 15;
    this._audioElement = null;
    this._audioSource = null;
    this._offline = !!this._master.context.length;

    this._initAudioSource();

    this._panner = this._createPanner();
    this._convolver = this._createReverb();
    this._dryGain = this._createGain();
    this._convolverGain = this._createGain();

    this._connect();

    this._initEvents();
  };

  _initAudioSource() {
    this._audioElement = document.createElement('audio');
    this._audioElement.src = this._url;
    this._audioElement.type = "audio/mpeg";
    this._audioElement.loop = true;
    this._audioSource = this._master.context.createMediaElementSource(this._audioElement);
  };

  _initEvents() {
    this.on('distanceChanged', this._updateGains);
  };

  _connect() {
    this._audioSource
      .connect(this._dryGain)
      .connect(this._panner);

    this._audioSource
      .connect(this._convolver)
      .connect(this._convolverGain)
      .connect(this._panner);
  };

  _disconnect() {
    this._audioSource.disconnect();
    this._convolver.disconnect();
    this._convolverGain.disconnect();
    this._panner.disconnect();
    this._dryGain.disconnect();
  };

  _createPanner() {
    var panner = this._master.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = this._scope;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.coneOuterAngle = 0;
    panner.coneOuterGain = 0;
    return panner;
  };

  _createReverb() {
    var convolver = this._master.context.createConvolver();
    convolver.buffer = ObjectSound.impulseResponse(this._master.context, 3, 30);
    // ObjectSound.predefinedImpulse("koli_summer_site4_stereo_bformat").then((buffer) => {
    //   convolver.buffer = buffer;
    // });
    return convolver;
  };

  _createGain() {
    var gain = this._master.context.createGain();
    gain.gain.setValueAtTime(0, this._master.context.currentTime);
    return gain;
  };

  _updateGains() {
    var updateGains = () => {
      let globalGain = (Math.sin(-Math.min(1, (this._distance / this._scope * 2 - 1)) * Math.PI / 2) + 1) / 2;
      // let convolverGain = -globalGain + 1;
      let convolverGain = -globalGain * 1.5 + 1.5;
      let dryGain = globalGain;
      this._dryGain.gain.setValueAtTime(dryGain * globalGain, this._master.context.currentTime);
      this._convolverGain.gain.setValueAtTime(convolverGain * globalGain, this._master.context.currentTime);
      console.log(convolverGain + " " + globalGain);
    };
    if (this._offline) updateGains();
    else {
      window.utils.cooldown(function() {
        updateGains();
      }, "reverb" + this._id, 100);
    }
  };

  getId() {
    return this._id;
  };

  play() {
    this._panner.connect(this._master);
    this._audioElement.play();
  };

  pause() {
    this._audioElement.pause();
    this._panner.disconnect();
  }

  stop() {
    this._audioElement.pause();
    this._audioElement.currentTime = 0;
  };

  setPosition(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._panner.setPosition(x, y + 0.8, z); // 0.8 : Head
  };

  updateDistanceFromListener(x, y, z) {
    this._distance = window.utils.distance({x: this._x, y: this._y, z: this._z}, {x: x, y: y, z: z});
    this._trigger('distanceChanged');
  };

  destroy() {
    this._trigger('destroy');
    this.stop();
    this._disconnect();
  };

};


ObjectSound.impulseResponse = function(audioContext, duration, decay) {
    var sampleRate = audioContext.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++) {
      impulseL[i + 3000] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      impulseR[i + 3000] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
};

ObjectSound.predefinedImpulses = {};
ObjectSound.waitingForImpulse = {};

ObjectSound.predefinedImpulse = function(name) {
  let firstLoad = false;
  if (!ObjectSound.predefinedImpulses[name]) {
    if (ObjectSound.predefinedImpulses[name] !== null)
      firstLoad = true;
    ObjectSound.predefinedImpulses[name] = null;  
  }

  if (!ObjectSound.predefinedImpulses[name])
    ObjectSound.predefinedImpulses[name] = null;

  return new Promise((resolve, reject) => {
    if (ObjectSound.predefinedImpulses[name]) resolve(ObjectSound.predefinedImpulses[name]);
    else if (!firstLoad) {
      if (!ObjectSound.waitingForImpulse[name]) ObjectSound.waitingForImpulse[name] = [];
      ObjectSound.waitingForImpulse[name].push(resolve);
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.onload  = function() {
        let audioData = xhr.response;

        AUDIO_CONTEXT.decodeAudioData(audioData,
          function(buffer) {
            resolve(buffer);
            ObjectSound.predefinedImpulses[name] = buffer;
            for (let i in ObjectSound.waitingForImpulse[name]) {
              ObjectSound.waitingForImpulse[name][i](buffer);
            }
            ObjectSound.waitingForImpulse = [];
          },
          function(e) {
            console.log("Error with decoding audio data" + e.err);
          }
        );
      };
      xhr.responseType = 'arraybuffer'
      xhr.open("GET", "resources/audio/impulses/" + name + ".ogg", true);
      xhr.send();
    }
  });
};

// Override to return destination on Safari
AudioNode.prototype.connectBackup = AudioNode.prototype.connect;
AudioNode.prototype.connect = function(destination, outputIndex, inputIndex) {
  this.connectBackup(destination, outputIndex, inputIndex);
  return destination;
};
