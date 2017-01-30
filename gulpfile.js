let gulp        = require( 'gulp' ),
    babelify    = require( 'babelify' ),
    browserify  = require( 'browserify' ),
    buffer      = require( 'vinyl-buffer' ),
    source      = require( 'vinyl-source-stream' ),
    browserSync = require( "browser-sync" ),
    csso        = require( 'csso' ),
    reload      = browserSync.reload,
    args        = require( 'yargs' ).argv,
    colors      = require( 'colors' ),
    plugins     = {}; // will fill from package.json

Object.keys( require( './package.json' )['devDependencies'] )
    .filter( ( pkg ) => {
        return pkg.indexOf( 'gulp-' ) === 0;
    } )
    .forEach( ( pkg ) => {
        plugins[pkg.replace( 'gulp-', '' ).replace( /-/g, '_' )] = require( pkg );
    } );

// server URL
let serverUrl = args.proxy;

if ( !serverUrl ) {
    serverUrl = 'local.example.dev';
};

////////////////////////////////////
//  PATHS
////////////////////////////////////

let path = {
    build: {
        build:    'public/',
        front_js: 'public/js/',
        css:      'public/css/',
        img:      'public/img/',
        fonts:    'public/fonts/'
    },
    src:   {
        src:      'src/',
        styles:   'src/styles/**/[^_]*.scss',
        entries:  ['./src/js/todo/todo.js', './src/js/main.js'],
        soures:   ['todo.js', 'main.js'],
        jsFolder: 'src/js/',
        img:      'src/img/*',
        fonts:    'src/fonts/**/*',
    },
    watch: {
        html:   'views/**/*',
        js:     'src/js/**/*',
        styles: 'src/styles/**/*',
        img:    'src/img/**/*',
        fonts:  'src/fonts/**/*'
    },
    clean: 'build/public/*'
};

////////////////////////////////////
//  JavaScript Tasks
////////////////////////////////////

gulp.task( 'js', () => {
    path.src.entries.forEach( function ( entry, i, entries ) {

        entries.remaining = entries.remaining || entries.length;

        browserify( {
            entries: entry,
            paths:   ['node_modules', path.src.jsFolder, path.src.jsFolder + '/todo/']
        } )
            .transform( babelify, {
                presets: ["es2015"]
            } )
            .bundle()
            .on( 'error', log )
            .pipe( source( path.src.soures[i] ) )
            .pipe( buffer() )
            .pipe( plugins.sourcemaps.init( {
                loadMaps: true
            } ) ) // todo: source maps doesn't work properly
            .pipe( plugins.sourcemaps.write( '.' ) )
            .pipe( gulp.dest( path.build.front_js ) )
            .on( 'error', log ) 
            .pipe( plugins.livereload() );
            
    } );
} );

////////////////////////////////////
//  Stylus Tasks
////////////////////////////////////

// gulp.task( 'stylus', () => {
//     gulp.src( path.build.css, {
//         read:  false,
//     } )
//         .pipe( plugins.clean({force: true}) );
//
//     gulp.src( path.src.styles )
//         .pipe( plugins.sourcemaps.init() )
//         .pipe( plugins.stylus( {
//             'include css': true
//         } ) ).on( 'error', log )
//         .pipe( plugins.csso() )
//         .pipe( plugins.rename( {
//             suffix: '.min'
//         } ) )
//         .pipe( plugins.sourcemaps.write( '.' ) )
//         .pipe( gulp.dest( path.build.css ) )
//         .pipe( plugins.livereload() );
// } );

////////////////////////////////////
//  SASS Tasks
////////////////////////////////////

gulp.task( 'sass',/* ['clear:css'],*/ () => {

    gulp.src( path.src.styles )
        .pipe( plugins.sourcemaps.init() )
        .pipe( plugins.sass( {outputStyle: 'compressed'} )
            .on( 'error', log ) )
        .pipe( plugins.rename( {
                    suffix: '.min'
                } ) )
        .pipe( plugins.sourcemaps.write('.') )
        .pipe( gulp.dest( path.build.css ) )
        .pipe( plugins.livereload() );
} );

gulp.task('clear:css', () => {
    gulp.src( path.build.css, {
        read: false,
        force: true
    } )
        .pipe( plugins.clean() );
})

////////////////////////////////////
// Autoprefixer Tasks
////////////////////////////////////

gulp.task( 'prefix', ['sass'], () => {
    gulp.src( path.build.css + '*.css' )
        .pipe( plugins.autoprefixer( ["last 8 version", "> 1%", "ie 9"] ) )
        .on( 'error', log )
        .pipe( gulp.dest( path.build.css ) );
} );

////////////////////////////////////
//  HTML Tasks
////////////////////////////////////

gulp.task( 'html', () => {
    gulp.src( path.watch.html )
        .pipe( plugins.livereload() );
} );

////////////////////////////////////
//  Images Tsaks
////////////////////////////////////

gulp.task( 'img', () => {
    gulp.src( path.src.img )
        .pipe( plugins.imagemin() ).on( 'error', log )
        .pipe( gulp.dest( path.build.img ) );
} );

////////////////////////////////////
// Watch
////////////////////////////////////

gulp.task( 'watch', () => {
    plugins.livereload.listen();
    gulp.watch( path.watch.js, ['js'] ).on( 'change', bim );
    gulp.watch( path.watch.styles, ['prefix'] ).on( 'change', bim );
   // gulp.watch( path.watch.html, ['html'] ).on( 'change', bim );
} );

////////////////////////////////////
// Work Tasks
////////////////////////////////////

gulp.task( 'default', ['js', 'sass', 'prefix', 'img', 'watch', 'server'] );
gulp.task( 'build', ['js', 'styles', 'prefix'] );

////////////////////////////////////
//  Clean Task
////////////////////////////////////

gulp.task( 'clean', () => {
    gulp.src( path.clean )
        .pipe( plugins.clean( {
            force: true
        } ) ).on( 'error', log )
} );

////////////////////////////////////
//  Server Task
////////////////////////////////////

gulp.task( 'server', () => {
    let stream = plugins.nodemon( {
        script:  'server.js',
        ignore:  ['public/', 'src/', 'gulpfile*'],
        //ext: 'js',
        "delay": "2500",
        env:     {
            'NODE_ENV': 'development'
        }
    } ).on( 'restart', () => {
        gulp.src( '.' )
            .pipe( plugins.notify( 'Server is starting...' ) )
            .pipe( plugins.livereload() );
    } ).on( 'crash', () => {
        console.error( 'Application has crashed!\n' );
        plugins.notify( 'OMG! Application has crashed!' );
        stream.emit( 'restart', 10 );
    } );
} );

////////////////////////////////////
//  Fonts Task
////////////////////////////////////

gulp.task( 'copyfonts', function () {
    gulp.src( path.src.fonts )
        .pipe( gulp.dest( path.build.fonts ) )
        .pipe( plugins.livereload() )
        .on( 'error', log );

    gulp.src( [
        'node_modules/font-awesome/fonts/fontawesome-webfont.*'] )
        .pipe( gulp.dest( path.build.fonts ) );
} );


/////////////////// Ennd of tasks /////////////////////////


gulp.copy = function ( src, dest, base ) {
    return gulp.src( src, {
        base: base
    } )
        .pipe( gulp.dest( dest ) )
};

//  Error Handler
let log = function ( error ) {
    let lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';
    let report     = '';
    let chalk      = plugins.util.colors.red.bold;

    report += chalk( 'TASK:' ) + ' [' + error.plugin + ']\n';
    report += chalk( 'PROB:' ) + ' ' + error.message + '\n';
    if ( error.lineNumber ) {
        report += chalk( 'LINE:' ) + ' ' + error.lineNumber + '\n';
    }
    if ( error.fileName ) {
        report += chalk( 'FILE:' ) + ' ' + error.fileName;
    }
    console.log( report );
    this.emit( 'end' );

    plugins.notify( {
        title:   'Task Failed [' + error.plugin + ']',
        message: 'OMG! [' + error.message + '] :(',
        sound:   'Basso' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    } ).write( error );


}

//  Push notification
let bim = ( event ) => {
    plugins.notify( {
        title:   event.type + ': ',
        message: 'File: ' + event.path,
        sound:   'Pop' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    } ).write( event );
}