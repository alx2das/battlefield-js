'use strict';

var pkg = require('./package.json'),
    gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    postcss = require('gulp-postcss'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    rename = require("gulp-rename"),
    del = require('del'),
    runSequence = require('run-sequence');

// очистка директории
gulp.task('clean', function () {
    return del('dist');
});

// обьединение файлов
gulp.task('concat', function (callback) {
    runSequence(
        ['concat:js', 'concat:css'],
        callback
    );
});

// обьединение JS файлов
gulp.task('concat:js', function () {
    return gulp
        .src([
            'src/js/battlefield.options.js',
            'src/js/battlefield.class-battlefield.js',
            'src/js/battlefield.class-field.js',
            'src/js/battlefield.class-battle.js',
            'src/js/battlefield.class-gameui.js',
            'src/js/battlefield.helper.js'
        ])
        .on('data', function (file) {
            file.contents = new Buffer(file.contents.toString() + '\n');
        })
        .pipe(concat('battlefield.js'))
        .on('data', function (file) {
            file.contents = new Buffer(
                description() +
                '(function(window){' +
                '   \n' +
                '   "use strict";' +
                '   \n\n' +
                file.contents.toString() +
                '   \n' +
                '   window.Battlefield = Battlefield;' +
                '   \n' +
                '})(window);'
            );
        })
        .pipe(gulp.dest('dist'));
});

// обьединение CSS файлов
gulp.task('concat:css', function () {
    return gulp
        .src('src/css/*.css')
        .pipe(postcss([autoprefixer()]))
        .pipe(concat('battlefield.css'))
        .on('data', function (file) {
                file.contents = new Buffer(
                    description() +
                    file.contents.toString()
                )
        })
        .pipe(gulp.dest('dist'));
});

// минификация файлов
gulp.task('min', function (callback) {
    runSequence(
        ['min:js', 'min:css'],
        callback
    );
});

// минификация JS файлов
gulp.task('min:js', function () {
    return gulp
        .src(['dist/battlefield.js'])
        .pipe(rename('battlefield.min.js'))
        .pipe(uglify())
        .on('data', function (file) {
            file.contents = new Buffer(
                description() +
                file.contents.toString()
            );
        })
        .pipe(gulp.dest('dist'));
});

// минификация CSS файлов
gulp.task('min:css', function () {
    return gulp
        .src(['dist/battlefield.css'])
        .pipe(rename('battlefield.min.css'))
        .pipe(minifyCSS())
        .on('data', function (file) {
            file.contents = new Buffer(
                description() +
                file.contents.toString()
            )
        })
        .pipe(gulp.dest('dist'));
});

// главная задача
gulp.task('default', function (callback) {
    runSequence(
        'clean',
        'concat',
        'min',
        callback
    );
});

// описание для файлов
function description() {
    return '' +
        '/**\n' +
        ' * ' + pkg.name + ' v' + pkg.version + '\n' +
        ' * ' + pkg.description + '\n' +
        ' * \n' +
        ' * repository: ' + pkg.repository.url + '\n' +
        ' * bugs: ' + pkg.repository + '\n' +
        ' * \n' +
        ' * Copyright 2017, ' + pkg.author + '\n' +
        ' * Date: ' + new Date().toDateString() + '\n' +
        ' */\n';
}