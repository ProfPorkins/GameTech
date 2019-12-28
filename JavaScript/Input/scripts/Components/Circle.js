//------------------------------------------------------------------
//
// Defines a 2D circle.  'spec' is defined as:
//    {
//        center: {x, y},
//        radius:
//    }
//
//------------------------------------------------------------------
Demo.components.Circle = function(spec) {
    'use strict';
    let radiusSq = spec.radius * spec.radius,    // This gets used by various mathematical operations to avoid a sqrt
        that = {
            get center() { return spec.center; },
            get radius() { return spec.radius; },
            get radiusSq() { return radiusSq; }
        };

    //------------------------------------------------------------------
    //
    // Checks to see if the two circles intersect each other.  Returns
    // true if they do, false otherwise.
    //
    //------------------------------------------------------------------
    that.intersects = function(other) {
        let distance = Math.pow((spec.center.x - other.center.x), 2) + Math.pow((spec.center.y - other.center.y), 2);

        return (distance < Math.pow(spec.radius + other.radius, 2));
    };

    return that;
};
