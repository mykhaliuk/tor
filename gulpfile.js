var gulp = require('gulp'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    args   = require('yargs').argv,
    colors = require('colors'),
    plugins = {}; // will fill from package.json

Object.keys(require('./package.json')['devDependencies'])
    .filter(function (pkg) {
        return pkg.indexOf('gulp-') === 0;
    })
    .forEach(function (pkg) {
        plugins[pkg.replace('gulp-', '').replace(/-/g, '_')] = require(pkg);
    });

// server URL
var serverUrl = args.proxy;

if (!serverUrl) {
    serverUrl = 'local.example.dev';
}
////////////////////////////////////
//  PATHS
////////////////////////////////////
var paths = {
    styles: 'src/front-end/styles',
    css: 'build/public/css'
};

////////////////////////////////////
//  Stylus Tasks
////////////////////////////////////
gulp.task('styles', function () {
    gulp.src(paths.styles + '/**/[^_]*.styl')
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stylus({
            compress: true,
            'include css': true
        }))
        .on('error', log)
        .pipe(plugins.csso())
        .on('error', log)
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream());
});
//////////////////////////////
// Autoprefixer Tasks
//////////////////////////////
gulp.task('prefix', function () {
    gulp.src(paths.css + '/*.css')
        .pipe(plugins.autoprefixer(["last 8 version", "> 1%", "ie 9"]))
        .on('error', log)
        .pipe(gulp.dest(paths.css));
});
//////////////////////////////
// Watch
//////////////////////////////
gulp.task('watch', function () {
   // gulp.watch(paths.js, ['lint', 'scripts']);
    gulp.watch(paths.styles + '/**/*.styl', ['styles']);
});
//////////////////////////////
// BrowserSync Task
//////////////////////////////
gulp.task('browserSync', function () {
    browserSync.init({
        proxy: serverUrl
    });
});
//////////////////////////////
// Server Tasks
//////////////////////////////
// gulp.task('default', ['scripts', 'watch', 'prefix']);
// gulp.task('serve', ['scripts', 'watch', 'prefix', 'browserSync'])
gulp.task('default', ['styles', 'watch', 'prefix']);


function log(error) {
    console.log([
        '',
        "          ERROR MESSAGE START         ".bold.red.underline,
        ("[" + error.name + " in " + error.plugin + "]").blue.bold,
        error.message,
        "          ERROR MESSAGE END           ".bold.red.underline,
        ''
    ].join('\n'));
    this.end();
}