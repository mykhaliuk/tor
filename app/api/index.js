

/////////////////////////////// T O D O  API //////////////////////////////////////////
var util = require('../../util'),
    Todo = require('../models/todo'),
    pug = require('pug'),
    todoDiv = pug.compileFile('views/todoDiv.pug');

module.exports = (app, passport) => {

    app.get('/api/todo/get-all', util.isLoggedIn, (req, res) => {
        var user_id = req.user._id;

        Todo.find({ user_id: user_id })
        //.sort({ '-updated_at': 'desc' })  //back oreder
        .sort( [ ["updated_at", -1], ["__v", 1] ] )              //normal order
        .then( todosArr => {
            res.render('todoDiv', { todos: todosArr });
        }).catch( err => {
            res.status(500).send('server or atabase error :( ');
            console.log('----! /api/todo/get-all --- Error: ' + err);
        });
    });

    app.post('/api/todo/add', util.isLoggedIn,  (req, res) => {
        var todosArr = new Array();
        new Todo({
            user_id: req.user._id,
            content: req.body.content,
            updated_at: Date.now()
        })
        .save()
        .then( todo => {
            todosArr.push(todo.toObject());
            res.render('todoDiv', { todos: todosArr });
        }).catch( err => {
            res.status(500).send('database error :( ');
            console.log('----! /api/todo/add --- Error: ' + err);
        });
    }); 

    app.post('/api/todo/update', util.isLoggedIn, (req, res) => {
        Todo.findById( req.body.id, (err, todo) => {
            if (err) return err => {
                res.status(500).send('не получилось наити');  //todo: English
                console.log('----! /api/todo/update --- Error: ' + err);
            }

            todo.content = req.body.content;
            todo.updated_at = Date.now();
            todo.__v += 1;
            todo.save()
                .then(() => {
                    console.log('saved');
                    res.sendStatus(200);
                })
                .catch(err => {
                res.status(500).send('не получилось обновить ');  //todo: English
                console.log('----! /api/todo/update --- Error: ' + err);
            });
        });
    });

    app.get('/api/todo/remove/:id', util.isLoggedIn, (req, res) => {
        Todo.findById(req.params.id)
        .exec()
        .then( todo => {
            if (todo.user_id != req.user._id) {
                return res.status(403).send('wrong owner!');;
            }
            todo.remove().then( todo => {
                res.sendStatus(200);
            });
        }).catch( err => {
            res.status(500).send('todo does not exist! Press "Refresh" button');
            console.log('----! /api/todo/add --- Error: ' + err);
        });
    });
};