var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    args = require('yargs').argv,
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
    build: {
        app: 'build/app/',
        configs: 'build/configs/',
        jade: 'build/views/',
        front_js: './build/public/js/',
        mapDir: 'build/public/js/maps/',
        css: 'build/public/css/',
        img: 'build/public/img/',
        fonts: 'build/public/fonts/'
    },
    src: {
        app: 'src/app/**/*.*',
        configs: 'src/configs/**/*.*',
        jade: 'src/views/**/*.*',
        styles: 'src/front-end/styles/**/[^_]*.styl',
        front_js: 'js/main.js',
        img: 'src/front-end/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'js/*.js',
        styles: 'src/front-end/styles/**/*.styl',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: 'build/*'
};
//todo: delete csso
////////////////////////////////////
//  JS Tasks
////////////////////////////////////
gulp.task('js', function () {
    browserify({
        entries: ['js/main.js'],
        paths: ['/node_modules','js/']
    })
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .on('error', function (e) {
            plugins.util.log(e)
        })
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest('build/public/js'))
})
/*gulp.task('js', function () {
 var bundler = browserify(paths.src.front_js)
 .transform(babelify, {presets: ['es2015']});
 bundle(bundler);
 });*/

////////////////////////////////////
//  Stylus Tasks
////////////////////////////////////
gulp.task('styles', function () {
    gulp.src(paths.build.css + '**/*.*', {read: false})
        .pipe(plugins.clean());
    gulp.src(paths.src.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stylus({
            compress: true,
            'include css': true
        }))
        .on('error', log)
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.build.css))
        .pipe(browserSync.stream());
});
//////////////////////////////
// Autoprefixer Tasks
//////////////////////////////
gulp.task('prefix', function () {
    gulp.src(paths.build.css + '*.css')
        .pipe(plugins.autoprefixer(["last 8 version", "> 1%", "ie 9"]))
        .on('error', log)
        .pipe(gulp.dest(paths.build.css));
});
//////////////////////////////
// Watch
//////////////////////////////
gulp.task('watch', function () {
    gulp.watch(paths.watch.js, ['js']);
    gulp.watch(paths.watch.styles, ['styles']);
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
gulp.task('default', ['js', 'styles', 'watch', 'prefix']);
////////////////////////////////////
//  Clean Task
////////////////////////////////////
gulp.task('clean', function () {
    gulp.src(paths.clean)
        .pipe(plugins.clean({}))
})

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