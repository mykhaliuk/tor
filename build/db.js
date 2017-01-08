var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
//var mongoURI = "mongodb://heroku_nrmhn9gw:mrr0l7bma7uldqpgjb08ishhlt@ds151078.mlab.com:51078/heroku_nrmhn9gw";
var mongoURI = "mongodb://localhost/tor-todo";


var Todo = new Schema({
    user_id    : String,
    content    : String,
    updated_at : Date
});

mongoose.model( 'Todo', Todo );
mongoose.connect(mongoURI, function (err, db) {
    if (err) {
        console.log("-=  ERR! can't connect to the database:  =-");
        throw err;
    } else {
        console.log("-=  successfully connected to the database:  =-");
    }
});
