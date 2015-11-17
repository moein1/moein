//we need at least the vendor task and deafault task for combining all the file together

var gulp=require('gulp'),
concat=require('gulp-concat'),
plumber=require('gulp-plumber'),
gulpif=require('gulp-if'),
ngAnnotate=require('gulp-ng-annotate'),
uglify=require('gulp-uglify'),
templateCache = require('gulp-angular-templatecache'),
header=require('gulp-header');
var csso = require('gulp-csso');


//var templateCache = require('gulp-angular-templatecache');

var banner=['/**',
'* Product Social',
'* (c) 2015 Mohammad Karimi',
'* License : MIT',
'Last Update <%= new Date().toUTCString() %>',
'*/',
''].join('\n');

/*
 |--------------------------------------------------------------------------
 | Combine all JS libraries into a single file for fewer HTTP requests.
 |--------------------------------------------------------------------------
 */

 gulp.task('minify',function () {
 	return gulp.src([
      'public/javascripts/vendors/angular.js',
      'public/javascripts/vendors/angular-messages.js',
      'public/javascripts/vendors/angular-resource.js',
      'public/javascripts/vendors/angular-route.js',
      'public/javascripts/vendors/angular-ui-bootstrap.js',
      'public/javascripts/vendors/angular-animate.js',
      'public/javascripts/vendors/angular-cookies.min.js',
      'public/javascripts/vendors/moment.min.js',
      'public/app.js',
      'public/testApp.js',
      'public/services/*.js',
      'public/controllers/*.js',
      'public/filter/*.js',
      'public/directives/*.js'
    ]).pipe(concat('app2.min.js'))
    .pipe(ngAnnotate())
 .pipe(uglify())
 .pipe(header(banner))
 .pipe(gulp.dest('public'))
 });

 /*minifying css files*/
gulp.task('styles',function () {
   return gulp.src([
    'public/stylesheets/bootstrap.css'
    ,'public/stylesheets/elegant-icons-style.css'
    ,'public/stylesheets/font-awesome.css'
    ,'public/stylesheets/line-icons.css'
    ,'public/stylesheets/productStyle.css'
    ,'public/stylesheets/animations.css'
    //,'public/stylesheets/bootstrap-theme.css'
  //  ,'public/stylesheets/style_nice.css'
    ]).pipe(concat('styles2.min.css'))
   .pipe(csso())
   .pipe(gulp.dest('public/stylesheets'))
});

/*minify tempalte cache*/
gulp.task('template2', function () {
   gulp.src('public/views/**/*.html')
  .pipe(templateCache({ root: 'views', module: 'productApp' }))
      .pipe(gulp.dest('public'));
});

gulp.task('watch',function () {
    //watching any change in javascript files
    gulp.watch(['public/**/*.js', '!public/app2.min.js',
     '!public/template2.js', '!public/javascripts/vendor'], ['minify']);
    //watching any change in styles files
    gulp.watch(['public/stylesheets/*.css','!public/stylesheets/styles2.min.css'],['styles'])
    //watching views for tempalte
    //gulp.watch('public/views/**/*.html', ['template2']);
});

 gulp.task('default',['minify','styles','watch']);

