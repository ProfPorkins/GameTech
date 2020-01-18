Demo.components.Collision = function(spec) {
    'use strict';
    if (spec == undefined) {
        spec = {
            firstOnly: true
        };
    }
    let api = {
        get name() { return 'collision'; },
        get firstOnly() { return spec.firstOnly}
    };

    return api;
};
