Demo.components.Position = function(spec) {
    'use strict';

    let api = {
        get name() { return 'position'; },
        get x() { return spec.segments[0].x; },
        get y() { return spec.segments[0].y; },
        get segments() { return spec.segments; }
    };

    return api;
};
