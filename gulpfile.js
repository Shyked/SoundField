var gulp = require('gulp');
var less = require('gulp-less');

var express = require('express');
var app = express();

 
gulp.task('less', function () {
  return gulp.src('./src/less/*.less')
    .pipe(less().on('error', function(err) {
      console.log(err);
      this.emit('end');
    }))
    .pipe(gulp.dest('./out/css'));
});
 
gulp.task('less:watch', function () {
  gulp.watch(['./src/less/*.less'], ['less']);
});

gulp.task('express', function() {
  app.use(express.static('out'));
  app.listen(3000);
});

gulp.task('run', ['less', 'less:watch', 'express']);
