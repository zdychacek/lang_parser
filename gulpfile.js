var gulp = require('gulp');
var http = require('http');
var ecstatic = require('ecstatic');
var traceur = require('gulp-traceur');
var rjs = require('gulp-requirejs');
var uglify = require('gulp-uglify');
var refresh = require('gulp-livereload');
var clean = require('gulp-clean');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');
var lr = require('tiny-lr');
var lrserver = lr();

var livereloadport = 35729;
var serverport = 8000;

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
    .pipe(refresh(lrserver));
});

gulp.task('build', function() {
    rjs({
      baseUrl: '.',
      out: distFolder + '/all.min.js',
      name: srcFolder + '/main',
      paths: {
        app: 'dist'
      }
    })
    .pipe(uglify())
    .pipe(gulp.dest('.'))
    .pipe(refresh(lrserver));
});

gulp.task('serve', function() {
  http.createServer(ecstatic({
    root: __dirname,
    cache: -1
  })).listen(serverport);
  lrserver.listen(livereloadport);
});

gulp.task('clean', function() {
  gulp.src(distFolder, {force: true})
    .pipe(clean());
});

gulp.task('watch', function() {
  gulp.watch(srcFolder + '/*.js', ['scripts']);
});

gulp.task('default', ['scripts', 'serve', 'watch']);
