export default {
    
    toast: function ( message, displayLength, styleClassName, iconClassName, completeCallback ) {
       
        let iconedMessage = '';

        if (!iconClassName || iconClassName.lenght <= 0){
            iconedMessage = message;
        } else {
            iconedMessage = '<i class="fa ' + iconClassName + ' fa-lg"></i>&nbsp' + message;
        }

        Materialize.toast ( iconedMessage, displayLength, styleClassName, completeCallback );
    },

    contentValid: function (content) {
        
         if ( !content || content.match(/^\s/) ) return false;
         return true;
    }

};