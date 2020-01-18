Demo.components.KeyboardControlled = function(spec) {
    'use strict';

    let api = {
        get name() { return Demo.enums.Input.KeyboardControlled; },
        get keys() { return spec.keys; }
    };

    return api;
};
