(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

;$(function () {
    // init side nav bar button
    $(".button-collapse").sideNav();

    //init modal windows with blur
    $('.modal').modal({
        ending_top: '5%',
        ready: function ready() {
            $('.on-modal-blur').addClass('blur');
        },
        complete: function complete() {
            $('.on-modal-blur').removeClass('blur');
        }
    });

    window.modalWindow = function ($elem, method) {
        $elem.modal(method);
    };

    //  set dropdown menu
    $('.dropdown-button').dropdown({
        inDuration: 300,
        outDuration: 225,
        constrain_width: false, // Does not change width of dropdown to that of the activator
        hover: false, // Activate on hover
        gutter: 0, // Spacing from edge
        belowOrigin: true, // Displays dropdown below the button
        alignment: 'right' // Displays dropdown with edge aligned to the left of button
    });
});

},{}]},{},[1]);

//# sourceMappingURL=main.js.map
