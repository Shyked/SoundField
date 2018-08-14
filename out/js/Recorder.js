
class Recorder extends EventHandler {

  constructor(input) {
    super();

    this._webAudioRecorder = new WebAudioRecorder(input, {
      workerDir: "vendor/WebAudioRecorder/", // must end with slash
      encoding: "mp3",
      options: {
        encodeAfterRecord: true
      }
    });

    this._initEvents();
  };

  _initEvents() {
    this._webAudioRecorder.onComplete = (rec, blob) => {
      this._trigger('finish', URL.createObjectURL(blob));
    };
  };

  record() {
    this._webAudioRecorder.startRecording();
  };

  finish() {
    this._webAudioRecorder.finishRecording();
  };

  cancel() {
    this._webAudioRecorder.cancelRecording();
  };

  destroy() {
    this._trigger('destroy');
    this.cancel();
  };

};
