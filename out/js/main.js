(function() {


  /* MAIN */

  var main = function() {

    window.AUDIO_CONTEXT = new (window.AudioContext || window.webkitAudioContext)();
    
    window.stage = new Stage("sample");


    // stage.play();

  };



  /* Start */

  var start = function() {
    this.removeEventListener('click', start);
    main();
  };
  document.getElementById('board').addEventListener('click', start);

})();






// OFFLINE_AUDIO_CONTEXT.startRendering().then(function(renderedBuffer) {
//   console.log('Rendering completed successfully');

//   // var audioResult = AUDIO_CONTEXT.createBufferSource();
//   // audioResult.buffer = renderedBuffer;
//   // audioResult.connect(AUDIO_CONTEXT.destination);
//   // audioResult.start();
// }).catch(function(err) {
//     console.log('Rendering failed: ' + err);
//     // Note: The promise should reject when startRendering is called a second time on an OfflineAudioContext
// });




// function impulseResponse( duration, decay, reverse ) {
//     var sampleRate = audioContext.sampleRate;
//     var length = sampleRate * duration;
//     var impulse = audioContext.createBuffer(2, length, sampleRate);
//     var impulseL = impulse.getChannelData(0);
//     var impulseR = impulse.getChannelData(1);

//     if (!decay)
//         decay = 2.0;
//     for (var i = 0; i < length; i++){
//       var n = reverse ? length - i : i;
//       impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//       impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
//     }
//     return impulse;
// }

// var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// var music = audioContext.createMediaElementSource(document.getElementById('music'));

// /* PANNING */

// var panner = audioContext.createPanner();
// // panner.panningModel = 'HRTF';
// panner.distanceModel = 'inverse';
// panner.refDistance = 1;
// panner.maxDistance = 10000;
// panner.rolloffFactor = 1;
// panner.coneInnerAngle = 360;
// panner.coneOuterAngle = 0;
// panner.coneOuterGain = 0;

// if(panner.orientationX) {
//   panner.orientationX.setValueAtTime(1, audioContext.currentTime);
//   panner.orientationY.setValueAtTime(0, audioContext.currentTime);
//   panner.orientationZ.setValueAtTime(0, audioContext.currentTime);
// } else {
//   panner.setOrientation(1,0,0);
// }

// if(panner.positionX) {
//   panner.positionX.setValueAtTime(0, audioContext.currentTime);
//   panner.positionY.setValueAtTime(0, audioContext.currentTime);
//   panner.positionZ.setValueAtTime(0, audioContext.currentTime);
// } else {
//   panner.setPosition(0,0,0);
// }

// var listener = audioContext.listener;

// if(listener.positionX) {
//   listener.positionX.setValueAtTime(1, audioContext.currentTime);
//   listener.positionY.setValueAtTime(0, audioContext.currentTime);
//   listener.positionZ.setValueAtTime(0, audioContext.currentTime);
// } else {
//   listener.setPosition(1,0,0);
// }

// // if(listener.forwardX) {
// //   listener.forwardX.setValueAtTime(0, audioContext.currentTime);
// //   listener.forwardY.setValueAtTime(0, audioContext.currentTime);
// //   listener.forwardZ.setValueAtTime(-1, audioContext.currentTime);
// //   listener.upX.setValueAtTime(0, audioContext.currentTime);
// //   listener.upY.setValueAtTime(1, audioContext.currentTime);
// //   listener.upZ.setValueAtTime(0, audioContext.currentTime);
// // } else {
// //   listener.setOrientation(0,0,-1,0,1,0);
// // }

// music.connect(panner);

// panner.connect(audioContext.destination);

// // music.connect(audioContext.destination);

// /* CONVOLVER */

// // var convolver = audioContext.createConvolver();
// // convolver.buffer = impulseResponse(0.1, 0, false);
// // convolver.connect(audioContext.destination);
// // music.connect(convolver);


