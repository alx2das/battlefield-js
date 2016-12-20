'use strict';

var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    gulpIf = require('gulp-if'),
    runSequence = require('run-sequence');


gulp.task('clean', function () {
    return del('dist')
});

gulp.task('copy', function () {
    return gulp
        .src('src/**/*.*')
        .pipe(gulpIf('*.css', concat('battlefield.css')))
        .pipe(gulpIf('*.js', concat('battlefield.js')))
        .pipe(gulp.dest('dist'))
});

gulp.task('copy:min', function () {
    return gulp
        .src('src/**/*.*')
        .pipe(gulpIf('*.css', concat('battlefield.min.css'))).pipe(gulpIf('*.css', minifyCSS()))
        .pipe(gulpIf('*.js', concat('battlefield.min.js'))) .pipe(gulpIf('*.js', uglify()))
        .pipe(gulp.dest('dist'))
});


gulp.task('build', function (callback) {
    runSequence(
        'clean',
        ['copy', 'copy:min'],
        callback
    )
});