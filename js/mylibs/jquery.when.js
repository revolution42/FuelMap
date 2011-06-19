(function( $ ) {

$.fn.when = function( events ) {
    // Get the list of events
    events = events.split( /\s/g );
    // Store one promise per element
    var promises = [];
    // For each element
    $.each( this, function( _, dom ) {
        var // Get the element as a jQuery object
            element = $( dom ),
            // Store one deferred by event
            deferreds = [];
        // For each event
        $.each( events, function( _, event ) {
            var // Create a deferred
                deferred = $.Deferred(),
                // Create a callback
                callback = function( evt ) {
                    // Resolve the deferred
                    deferred.resolve();
                    // Unbind the callback
                    element.unbind( event, callback );
                };
            // Store in the list of deferred
            deferreds.push( deferred );
            // Bind the callback for the event on this element
            element.bind( event, callback );
        } );
        // Store the promise for this element
        promises.push( $.when.apply( null, deferreds ) );
    } );
    // Return the joined promise
    return $.when.apply( null, promises );
};

})( jQuery );