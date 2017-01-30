;$(function(){
    // init side nav bar button
    $(".button-collapse").sideNav();

    //init modal windows with blur
    $('.modal').modal({
        ending_top: '5%',
        ready: function () {
            $('.on-modal-blur').addClass('blur');
        },
        complete: function () {
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

