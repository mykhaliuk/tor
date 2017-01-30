// set up ======================================================================
var express      = require( 'express' ),
    app          = express(),
    port         = process.env.PORT || 8080,
    mongoose     = require( 'mongoose' ),
    path         = require( 'path' ),
    passport     = require( 'passport' ),
    flash        = require( 'connect-flash' ),
    morgan       = require( 'morgan' ),
    cookieParser = require( 'cookie-parser' ),
    bodyParser   = require( 'body-parser' ),
    session      = require( 'express-session' ),
    configDB     = require( './config/database.js' );

// configuration ===============================================================
mongoose.connect( configDB.url );
mongoose.Promise = global.Promise;

require( './config/passport' )( passport ); // pass passport for configuration

app.use( morgan( 'dev' ) );
app.use( cookieParser() );
app.use( bodyParser( {
    extended: true
} ) );
app.use( bodyParser.urlencoded( {
    extended: false
} ) );
app.use( bodyParser.json() );
app.set( 'view engine', 'pug' );
app.set( 'views', path.join( __dirname, 'views' ) );
app.use( session( {
    secret:            'ilovescotchscotchyscotchscotch',
    resave:            true,
    saveUninitialized: true
} ) );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( flash() );

// routes ======================================================================
require( './routes' )( app, passport );

// API =========================================================================
require( './app/api' )( app, passport );

// static ======================================================================
app.use( express.static( 'public' ) );

// launch ======================================================================
app.listen( port );
console.log('\x1b[35m%s\x1b[0m', 'The magic happens on port ' + port);