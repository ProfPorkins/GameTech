Demo.components.KeyboardControlled = function(spec) {
    'use strict';

    let api = {
        get name() { return 'keyboard-controlled'; },
        get keys() { return spec.keys; }
    };

    return api;
};
