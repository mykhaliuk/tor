(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = {

    toast: function toast(message, displayLength, styleClassName, iconClassName, completeCallback) {

        var iconedMessage = '';

        if (!iconClassName || iconClassName.lenght <= 0) {
            iconedMessage = message;
        } else {
            iconedMessage = '<i class="fa ' + iconClassName + ' fa-lg"></i>&nbsp' + message;
        }

        Materialize.toast(iconedMessage, displayLength, styleClassName, completeCallback);
    },

    contentValid: function contentValid(content) {

        if (!content || content.match(/^\s/)) return false;
        return true;
    }

};

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lib = require('../lib.js');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (event) {

    var toast = _lib2.default.toast,
        $input = $('[name = "input"]'),
        $collection = $('.collection'),
        content = $input.val();

    event.preventDefault();
    event.stopPropagation();

    if (!_lib2.default.contentValid(content)) {

        toast("Sorry, Todo can't be started with a space!", 5000, 'toast-warning', 'fa-info');
        return;
    };

    $.post('/api/todo/add', { 'content': content }).done(function (data) {
        $input.val(''); //clear input

        var $div = $(data);

        $div.hide();
        $collection.prepend($div);
        $div.velocity({ opacity: 1 }, {
            display: "block",
            duration: 500,
            easing: "easeInSine"
        });
    }).fail(function (err) {
        toast("Opps! Can't add new intem. " + err.responseText, 5000, 'toast-error', 'fa-exclamation');
    });
};

},{"../lib.js":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lib = require('lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toast = _lib2.default.toast;

exports.default = function (event) {

    event.preventDefault();
    event.stopPropagation();

    var $el_a = $(event.target).parent(),
        $el_li = $el_a.parent(),
        $span = $el_li.find('span'),
        content = $span.text(),
        id = $(event.target).data('id');

    $el_a.detach();
    $el_li.text('').append('<input id="edit-todo" type="text">');

    var $tempInput = $('#edit-todo');
    $tempInput.val(content).focus();

    $tempInput.on('change', function (e) {

        e.preventDefault();
        e.stopPropagation();

        update(id, $span, $el_a, $el_li, $tempInput, content);
    });

    console.log($(event.target));
    console.log($el_a, $el_li);
    console.log(content);
};

function update(id, $span, $el_a, $el_li, $tempInput, content) {

    if (!_lib2.default.contentValid($tempInput.val())) return;

    $.post('/api/todo/update', {
        'id': id,
        'content': $tempInput.val()
    }).done(function () {
        $span.text($tempInput.val());
        $tempInput.detach();
        $span.appendTo($el_li);
        $el_a.appendTo($el_li);
        $el_li.prependTo($('.collection'));

        toast("Saved", 2000, 'toast-success', 'fa-check');
        console.log('Edited. id: ', id);
    }).fail(function (err) {
        toast("Opps! Can't update todo. Error: " + err.responseText, 5000, 'toast-error');
        $el_li.text(content);
        $el_a.appendTo($el_li);
        console.log(err);
    });
}

},{"lib":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toast = _lib2.default.toast;

exports.default = function () {

  var $input = $('[name = "input"]'),
      $collection = $('.collection');

  $.get('/api/todo/get-all').done(function (data) {
    //console.log( data );
    $collection.append(data);
    $input.focus();
    toast("Welcome, User!", 2500, 'toast-success', 'fa-info');
  }).fail(function (err) {
    toast("Opps! Can't get todos. Error: " + err.responseText, 5000, 'toast-error', 'fa-exclamation');
  });
};

},{"../lib":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toast = _lib2.default.toast;

exports.default = function (event) {

    var $element = $(event.target),
        id = $element.data('id');

    event.preventDefault();
    event.stopPropagation();

    $.get('/api/todo/remove/' + id).done(function () {
        var $el_li = $element.parent().parent();

        $element.velocity({
            opacity: 0,
            scale: 3
        }, {
            duration: 300,
            complete: function complete() {
                $el_li.velocity({
                    opacity: 0,
                    translateX: '100%'
                }, {
                    duration: 500,
                    complete: function complete() {
                        $el_li.remove();
                    }
                });
            }
        });
    }).fail(function (err) {
        toast("Opps! Can't remove this intem. Error: " + err.responseText, 5000, 'toast-warning', 'fa-exclamation');
        console.log(err);
    });
};

},{"../lib":1}],6:[function(require,module,exports){
'use strict';

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

var _getAllTodo = require('_get-all-todo');

var _getAllTodo2 = _interopRequireDefault(_getAllTodo);

var _addTodo = require('_add-todo');

var _addTodo2 = _interopRequireDefault(_addTodo);

var _removeTodo = require('_remove-todo');

var _removeTodo2 = _interopRequireDefault(_removeTodo);

var _editTodo = require('_edit-todo');

var _editTodo2 = _interopRequireDefault(_editTodo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

$(function () {
  var $input = $('#new-todo'),
      $body = $('body');

  (0, _getAllTodo2.default)();

  $input.change(_addTodo2.default);
  $body.on('click', '.edit-todo', _editTodo2.default);
  $body.on('click', '.delete-todo', _removeTodo2.default);
  //$body.on('click', '.done-todo', makeDone); //todo: to implement 
});

// todo: implement components with fetch()  

/*fetch ( '/api/t o d o/add', {
 method:  "POST",
 headers: {
 'Content-Type': 'application/json'
 },
 body:    {"0000000": "fjkldfslkjsdf"}
 } )
 .then ( status )
 .then ( json )
 .then ( data => {
 console.log ( ' 000 Request succeeded with JSON response', data );
 } ).catch ( error => {
 console.log ( ' !!! Request failed: ', error );
 } );
 function status ( response ) {
 if ( response.status >= 200 && response.status < 300 ) {
 return Promise.resolve ( response )
 } else {
 return Promise.reject ( new Error ( response.statusText ) )
 }
 }

 function json ( response ) {
 return response.json ()
 }
 */

},{"../lib":1,"_add-todo":2,"_edit-todo":3,"_get-all-todo":4,"_remove-todo":5}]},{},[6]);

//# sourceMappingURL=todo.js.map
