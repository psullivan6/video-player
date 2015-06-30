'use strict';

// #############################################################################
// Plugins
// #############################################################################
var autoprefixer = require('gulp-autoprefixer');
var concat       = require('gulp-concat');
var del          = require('del');
var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var minify_css   = require('gulp-minify-css');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');



// #############################################################################
// Convenience Variables + Functions
// #############################################################################
var localTask = true;

var handleErrors = function(error){
  console.warn('\n', error.toString(), '\n');
};

var paths = {
  css:  '_source/css/**/*.scss',
  html: '_source/**/*.html',
  js:   '_source/**/*.js'
};


// #############################################################################
// Tasks | Compile, Move, and error check
// #############################################################################

// =============================================================================
// Tasks > Compile CSS                                                $ gulp css
// =============================================================================
gulp.task('css', function(){
  return gulp.src(paths.css)
      .pipe(sourcemaps.init())
      .pipe(gulpif(localTask, sourcemaps.init()))
        .pipe(sass().on('error', handleErrors))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(concat('styles.css'))
        .pipe(gulpif(!localTask, minify_css()))
      .pipe(gulpif(localTask, sourcemaps.write()))
    .pipe(gulp.dest('build/css'));
});

// =============================================================================
// Tasks > Move HTML                                                 $ gulp html
// =============================================================================
gulp.task('html', function() {
  return gulp.src(paths.html)
    .pipe(gulp.dest('build'));
});

// =============================================================================
// Tasks > Front-end JS compilation                                    $ gulp js
// =============================================================================
gulp.task('js', function() {
  return gulp.src(paths.js)
    .pipe(gulp.dest('build'));
});

// =============================================================================
// Tasks > JS Hint                                                 $ gulp jshint
// =============================================================================
gulp.task('jshint', function(){
  return gulp.src(paths.js)
    .pipe(plumber({ errorHandler: handleErrors }))
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('fail', { verbose: true }))
    .pipe(plumber.stop());
});


// #############################################################################
// Tasks | Local Development related tasks
// #############################################################################

// =============================================================================
// Tasks > Watch files then run tasks                               $ gulp watch
// =============================================================================
gulp.task('watch', function() {
  gulp.watch(paths.css,  ['css']);
  gulp.watch(paths.js,   ['js']);
  gulp.watch(paths.html, ['html']);
});

// =============================================================================
// Tasks > Clean Disribution/Build Directory                        $ gulp clean
// =============================================================================
gulp.task('clean', function (callback) {
  del('build', callback);
});


// #############################################################################
// Tasks | Build and deployment related tasks
// #############################################################################

// =============================================================================
// Tasks > Default task                                                   $ gulp
// =============================================================================
gulp.task('default', ['html', 'css', 'js']); // for local development

module.exports = gulp;