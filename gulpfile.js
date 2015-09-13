var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var nodemon = require('gulp-nodemon');

gulp.task('default', ['concatDevScripts', 'concatBowerScripts', 'watch', 'start']);
gulp.task('build', ['concatDevScripts', 'watch', 'start']);

gulp.task('concatDevScripts', function() {
  return gulp.src(['client/scripts/app.js', 'client/scripts/app.config.js', 'client/scripts/app.run.js', 'client/scripts/directives/*.js', 'client/scripts/services/*.js'])
    .pipe(concat('dev.min.js'))
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('concatBowerScripts', function() {
  return gulp.src(['client/bower_components/angular/angular.min.js', 'client/bower_components/angular-ui-router/release/angular-ui-router.min.js', 'client/bower_components/angular-local-storage/dist/angular-local-storage.min.js', 'client/bower_components/async/dist/async.min.js'])
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('./client/dist/'));
});

gulp.task('start', function() {
  nodemon({
      script: './server/app',
      ext: 'js'
    })
    .on('restart', function() {
      console.log('server restarted');
    })
});

gulp.task('watch', function() {
  gulp.watch('client/scripts/**/*.js', ['concatDevScripts']);
});
