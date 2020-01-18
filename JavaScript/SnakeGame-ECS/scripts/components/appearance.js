Demo.components.Appearance = function(spec) {
    'use strict';

    let api = {
        get name() { return 'appearance'; },
        get fillStart() { return spec.fillStart; },
        get fillEnd() { return spec.fillEnd; },
        get stroke() { return spec.stroke; }
    };

    return api;
};
