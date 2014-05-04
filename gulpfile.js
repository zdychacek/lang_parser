var gulp = require('gulp');
var traceur = require('gulp-traceur');
var rjs = require('gulp-requirejs');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');
var connect = require('gulp-connect');

var srcFolder = 'app';
var distFolder = 'dist';

var onError = function (err) {
  gutil.beep();
  gutil.log(err);
};

gulp.task('scripts', function() {
  return gulp.src(srcFolder + '/**/*.js')
    .pipe(changed(distFolder))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(traceur({
        modules: 'amd',
        experimental: true,
        blockBinding: true
      })
    )
    .pipe(gulp.dest(distFolder))
    .pipe(connect.reload());
});

gulp.task('build', function() {
  return rjs({
    baseUrl: '.',
    out: distFolder + '/all.min.js',
    name: srcFolder + '/main',
    paths: {
      app: 'dist'
    }
  })
  .pipe(uglify())
  .pipe(gulp.dest('.'))
  .pipe(connect.reload());
});

gulp.task('serve', function() {
  return connect.server({
    root: __dirname,
    port: 8000,
    livereload: true
  });
});

gulp.task('clean', function() {
  return gulp.src(distFolder, {force: true})
    .pipe(clean());
});

gulp.task('watch', function() {
  return gulp.watch(srcFolder + '/**/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'serve', 'watch']);
