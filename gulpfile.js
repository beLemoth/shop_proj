var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	spritesmith = require('gulp.spritesmith'),
	browserSync = require('browser-sync').create(),
	concat = require('gulp-concat'),
	uglyfly = require('gulp-uglyfly'),
	rename = require("gulp-rename"),
	cssnano = require('gulp-cssnano'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	ftp = require('gulp-ftp');

// static server
gulp.task('server', function () {
    browserSync.init({
        server: {baseDir: 'app'}
    });
});

//sprites
gulp.task('sprite', function () {
  // Generate our spritesheet 
	var spriteData = gulp.src('app/img/icons/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: 'sprite.css'
	}));
	spriteData.img
    	.pipe(gulp.dest('app/css'));
	spriteData.css
    	.pipe(gulp.dest('app/css'));
});

// css compilating
gulp.task('sass', ['sprite'], function () {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
            browsers: ['last 15 versions', '>1%', 'ie 8', 'ie 7'],
            cascade: false
        }))
    .pipe(gulp.dest('app/css'));

});

// minify css
gulp.task('minify', ['sass'], function() {
    return gulp.src(['app/css/*.css', '!app/css/*.min.css'])
        .pipe(cssnano())
        .pipe(rename({suffix:'.min'}))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({stream: true}));
});

// jScripts
gulp.task('scripts:base', function() {
  return gulp.src([
  	'bower_components/jquery/dist/jquery.js',
  	'bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
  	])
    .pipe(concat('base.js'))
    .pipe(gulp.dest('app/js'));
});
/*gulp.task('scripts:libs', function() {
  return gulp.src([
  	'bower_components/bPopup/jquery.bpopup.min.js',
  	'bower_components/owl.carousel/docs/assets/owlcarousel/owl.carousel.min.js',
  	])
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('app/js'));
});*/
gulp.task('scripts',['scripts:base'/*,'scripts:libs'*/], function () {
	gulp.src(['app/js/**/*.js','!app/js/**/*.min.js'])
    .pipe(uglyfly())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('app/js'));
});

// gulp watching
gulp.task('watch', ['server', 'minify', 'scripts'], function () {
  gulp.watch('app/sass/**/*.scss', ['minify']);
  gulp.watch('app/img/icons/*.png', ['minify']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
  gulp.watch('app/js/main.js', ['scripts']);
});

//build
gulp.task('clear', ['minify', 'scripts'], function() {
	return del.sync('dist');
});
gulp.task('images', ['clear'], function () {
    gulp.src(['app/img/**/*', '!app/img/icons/**/*'])
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
});
gulp.task('copy', ['images'], function() {
	return gulp.src(['app/**/*','!app/img/**/*'])
	.pipe(gulp.dest('dist'));
});
gulp.task('build', ['copy'], function() {
	return del.sync([
		'dist/sass',
		'dist/css/*.css',
		'!dist/css/*.min.css',
		'dist/js/*.js',
		'!dist/js/*.min.js',
		'dist/img/icons'
	]);
});

//upload
gulp.task('upload', function() {
	gulp.src('dist/**/*')
		.pipe(ftp({
			host: '137.74.93.42',
			user: 'upload_robot',
			pass: 'U7t0W8w2'
		}))
})