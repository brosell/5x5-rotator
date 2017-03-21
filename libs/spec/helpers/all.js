all = function(tag, cases, fn) {
    for(var i=0; i<cases.length; i++) {
        var tc = cases[i];
        (function(tc) {
            it(tag +': ' + JSON.stringify(tc).substring(0, 16), function() { fn(tc); } );
        })(tc);
    }    
}
