var gulp = require('gulp');
var pkg = require('./package.json');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var umd = require('gulp-umd');
var header = require('gulp-header');
var jshint = require('gulp-jshint');

var banner = [
    '/**',
    ' * @name <%= pkg.name %>: <%= pkg.description %>',
    ' * @version <%= pkg.version %> <%= new Date().toUTCString() %>',
    ' * @author <%= pkg.author %>',
    ' * @license <%= pkg.license %>',
    ' * @url <%= pkg.repository.url %>',
    ' */'
].join('\n');

var src = ['config.js', 
		   'utils.js', 
		   'element.js',
		   'group.js',
		   'ui.js',
		   'step.js',
		   'main.js'];

gulp.task('compile', function() {
    return gulp.src(src, {cwd: 'src'})
        .pipe(concat('forrm.js'))
        .pipe(umd())
        .pipe(header(banner + '\n', { pkg: pkg }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('dev', ['compile'], function() {
    gulp.watch(['src/*.js',], ['hint', 'compile']);
});

gulp.task('hint', function() {
	gulp.src('src/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('compress', function() {
    return gulp.src('dist/forrm.js')
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(rename('forrm.min.js'))
        .pipe(gulp.dest('dist/'));
});