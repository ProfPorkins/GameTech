//------------------------------------------------------------------
//
// Defines a simulation entity.  'spec' is defined as:
//    {
//        center: {x, y},
//        direction:  {x, y},
//        radius:
//    }
//
//------------------------------------------------------------------
Demo.components.Entity = function(spec) {
    'use strict';
    let that = Demo.components.Circle(spec);

    Object.defineProperty(that, 'direction', {
        value: spec.direction,
        writable: true,
        enumerable: true,
        configurable: true
    });

    //------------------------------------------------------------------
    //
    // Move the entity based upon its current direction, elapsed time and
    // direction vector.  When the entity goes outside of the unit world,
    // have it enter at the appropriate side of the world based on its
    // position.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        //
        // Divide by 1000 to convert elapsedTime from milliseconds to seconds
        spec.center.x += (spec.direction.x * elapsedTime / 1000);
        spec.center.y += (spec.direction.y * elapsedTime / 1000);
        //
        // If the circle hits the world walls, reflect its direction.
        if ((spec.center.x < spec.radius) || (spec.center.x > (1.0 - spec.radius))) {
            spec.direction.x *= -1;
            //
            // Move the circle radius distance away from the edge so we don't
            // get stuck on it.
            spec.center.x = Math.max(spec.center.x, spec.radius);
            spec.center.x = Math.min(spec.center.x, 1.0 - spec.radius);
        }
        if ((spec.center.y < spec.radius) || (spec.center.y > (1.0 - spec.radius))) {
            spec.direction.y *= -1;
            //
            // Move the circle radius distance away from the edge so we don't
            // get stuck on it.
            spec.center.y = Math.max(spec.center.y, spec.radius);
            spec.center.y = Math.min(spec.center.y, 1.0 - spec.radius);
        }
    };

    return that;
};
