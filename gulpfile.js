var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    browserSync = require("browser-sync"),
    csso = require('csso'),
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
var path = {
    build: {
        build: 'build/',
        views: 'build/public/',
        front_js: 'build/public/js/',
        css: 'build/public/css/',
        img: 'build/public/img/',
        fonts: 'build/public/fonts/'
    },
    src: {
        src: 'src/',
        styles: 'src/styles/**/[^_]*.styl',
        entries: ['src/js/main.js'],
        jsFolder: 'src/js/',
        img: 'src/img/*',
        fonts: 'src/fonts/'
    },
    watch: {
        html: 'build/views/**/*',
        js: 'src/js/**/*',
        styles: 'src/styles/**/*',
        img: 'src/img/**/*',
        fonts: 'src/fonts/**/*'
    },
    clean: 'build/public/*'
};
////////////////////////////////////
//  JavaScript Tasks
////////////////////////////////////
gulp.task('js', function () {
    browserify({
        entries: [path.src.entries],
        paths: ['/node_modules', path.src.jsFolder]
    })
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .on('error', log)
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(plugins.sourcemaps.init({loadMaps: true}))    // todo: source maps doesn't work properly
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.front_js))
        .pipe(plugins.livereload());
});
////////////////////////////////////
//  Stylus Tasks
////////////////////////////////////
gulp.task('styles', function () {
    gulp.src(path.build.css, {read: false, force: true})
        .pipe(plugins.clean());
    gulp.src(path.src.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.stylus({
            'include css': true
        })).on('error', log)
        .pipe(plugins.csso()).on('error', log)
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(plugins.sourcemaps.write('.'))
        .pipe(gulp.dest(path.build.css))
        .pipe(plugins.livereload());
    //.pipe(browserSync.stream());
});
////////////////////////////////////
// Autoprefixer Tasks
////////////////////////////////////
gulp.task('prefix', ['styles'], function () {
    gulp.src(path.build.css + '*.css')
        .pipe(plugins.autoprefixer(["last 8 version", "> 1%", "ie 9"]))
        .on('error', log)
        .pipe(gulp.dest(path.build.css));
});
////////////////////////////////////
//  Images Tsaks
////////////////////////////////////
gulp.task('img', function () {
    gulp.src(path.src.img)
        .pipe(plugins.imagemin()).on('error', log)
        .pipe(gulp.dest(path.build.img));
});
////////////////////////////////////
//  HTML Tasks
////////////////////////////////////
gulp.task('html', function () {
    gulp.src(path.build.views)
        .pipe(plugins.livereload())
});
////////////////////////////////////
// Watch
////////////////////////////////////
gulp.task('watch', function () {
    plugins.livereload.listen();
    gulp.watch(path.watch.js, ['js']).on('change', bim);
    gulp.watch(path.watch.styles, ['prefix']).on('change', bim);
    gulp.watch(path.watch.html, ['html']).on('change', bim);
});
////////////////////////////////////
// BrowserSync Task
////////////////////////////////////
gulp.task('browserSync', function () {
    browserSync.init({
        proxy: serverUrl
    });
});
////////////////////////////////////
// Work Tasks
////////////////////////////////////
gulp.task('default', ['js', 'styles', 'prefix', 'img', 'watch', 'server']);
gulp.task('build', ['js', 'styles', 'prefix']);
////////////////////////////////////
//  Clean Task
////////////////////////////////////
gulp.task('clean', function () {
    gulp.src(path.clean)
        .pipe(plugins.clean({force: true})).on('error', log)
});
////////////////////////////////////
//  Server Task
////////////////////////////////////
gulp.task('server', function () {
    plugins.nodemon({
        script: './build/app.js',
        ignore: ['build/public/', 'src/', 'gulpfile*'],
        //ext: 'js',
        env: {'NODE_ENV': 'development'}
    }).on('restart', function () {
        gulp.src('build/')
            .pipe(plugins.notify('Server is starting...'))
            .pipe(plugins.livereload())
    }).on('crash', function () {
        console.error('Application has crashed!\n')
        plugins.notify('OMG! Application has crashed!')
        stream.emit('restart', 10)
    });
});

//  Error Handler
    var log = function (error) {
        var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

        plugins.notify({
            title: 'Task Failed [' + error.plugin + ']',
            message: 'OMG! [' + error.plugin + '] :(',
            sound: 'Basso' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
        }).write(error);

        var report = '';
        var chalk = plugins.util.colors.red.bold;

        report += chalk('TASK:') + ' [' + error.plugin + ']\n';
        report += chalk('PROB:') + ' ' + error.message + '\n';
        if (error.lineNumber) {
            report += chalk('LINE:') + ' ' + error.lineNumber + '\n';
        }
        if (error.fileName) {
            report += chalk('FILE:') + ' ' + error.fileName;
        }
        console.error(report);
        this.emit('end');
    }

//  Push notification
    var bim = function (event) {
        plugins.notify({
            title: 'Watcher [' + event.type + ']',
            message: 'File: ' + event.path,
            sound: 'Pop' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults

        }).write(event);
    }