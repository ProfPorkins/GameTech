Demo.components.Appearance = function(spec) {
    'use strict';

    let api = {
        get name() { return 'appearance'; },
        get fill() { return spec.fill; },
        get stroke() { return spec.stroke; }
    };

    return api;
};
