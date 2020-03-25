//------------------------------------------------------------------
//
// Queue data structure used for holding network messages.  I'm actually
// just using an array and adding a couple of functions that wrap
// the pop and shift operations.
//
//------------------------------------------------------------------
(function(exports) {
    'use strict';

    exports.create = function() {
        let that = [];

        that.enqueue = function(value) {
            that.push(value);
        }
    
        that.dequeue = function() {
            return that.shift();
        }
    
        Object.defineProperty(that, 'front', {
            get: () => that[0]
        });
    
        Object.defineProperty(that, 'empty', {
            get: () => { return that.length === 0; }
        });

        return that;
    };

})(typeof exports === 'undefined' ? this['Queue'] = {} : exports);
