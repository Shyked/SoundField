
var Recorder = function(input) {

  EventHandler.apply(this);

  this._webAudioRecorder = null;

  this._init = function() {
    this._webAudioRecorder = new WebAudioRecorder(input, {
      workerDir: "vendor/WebAudioRecorder/", // must end with slash
      encoding: "mp3",
      options: {
        encodeAfterRecord: true
      }
    });

    this._initEvents();
  };

  this._initEvents = function() {
    var that = this;
    this._webAudioRecorder.onComplete = function(rec, blob) {
      that._trigger('finish', URL.createObjectURL(blob));
    };
  };

  this.record = function() {
    this._webAudioRecorder.startRecording();
  };

  this.finish = function() {
    this._webAudioRecorder.finishRecording();
  };

  this.cancel = function() {
    this._webAudioRecorder.cancelRecording();
  };

  this.destroy = function() {
    this._trigger('destroy');
    this.cancel();
  };

  this._init();

};
