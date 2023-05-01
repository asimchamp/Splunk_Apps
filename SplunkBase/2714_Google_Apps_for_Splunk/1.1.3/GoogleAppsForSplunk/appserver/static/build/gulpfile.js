var gulp = require('gulp'),
	bower = require('gulp-bower'),
	concat = require('gulp-concat'),
	less = require('gulp-less'),
	rename = require('gulp-rename');

gulp.task('copy:requires', function(){
        gulp.src([
                './bower_components/d3/d3.min.js',
		'./bower_components/sidr/jquery.sidr.min.js'
                 ])
                .pipe(rename(function(path) {path["dirname"] = "";}))
                .pipe(gulp.dest('../js'));
});

gulp.task('default',[ 'copy:requires'], function() {});

