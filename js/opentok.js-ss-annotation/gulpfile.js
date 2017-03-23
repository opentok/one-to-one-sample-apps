var gulp = require('gulp');
var concat = require('gulp-concat');
// var importCss = require('gulp-import-css');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
// var unzip = require('gulp-unzip');
var concatCss = require('gulp-concat-css');


gulp.task('default', ['js', 'css']);
gulp.task('dev', ['js-dev', 'css']);


var jsSourceFiles = [
  'src/opentok-solutions-logging.js',
  'src/opentok-one-to-one-communication.js',
  'src/opentok-screen-sharing.js',
  'src/opentok-annotation.js',
];

gulp.task('js', function () {
  return gulp.src(jsSourceFiles)
    .pipe(concat('screenshare-annotation-acc-pack.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('js-dev', function () {
  return gulp.src(jsSourceFiles)
    .pipe(concat('screenshare-annotation-acc-pack.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
  return gulp.src('css/*.css')
    .pipe(concatCss('opentok-style.css'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('images', function () {
  return gulp.src(
    [
      'images/**'
    ], { base: 'images/' })
 .pipe(gulp.dest('dist/images'));
});

// gulp.task('unzip', function(){
//   gulp.src("./annotations.zip")
//     .pipe(unzip())
//     .pipe(gulp.dest('./annotations'))
// });

gulp.task('zip', function () {
  return gulp.src([
    'dist/theme.css',
    'dist/annotation.css',
    'dist/images/**',
    'dist/screenshare-annotation-acc-pack.js'
  ], { base: 'dist/' })
    .pipe(zip('opentok-js-screenshare-annotation-1.1.0.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['js', 'css', 'images', 'zip']);
