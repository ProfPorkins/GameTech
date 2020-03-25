//------------------------------------------------------------------
//
// Defines a Missile component.  A Missile is defined as
//  {
//      center: { x: , y: }     // In world coordinates
//      radius:                 // In world units
//      momentum: { x: , y: },  // In workd units per millisecond
//      timeRemaining:          // How much life left before it is gone, in milliseocns
//  }
//
//------------------------------------------------------------------
Demo.components.Missile = function(spec) {
    'use strict';
    let that = {};

    Object.defineProperty(that, 'center', {
        get: () => spec.center
    });

    Object.defineProperty(that, 'radius', {
        get: () => spec.radius
    });

    Object.defineProperty(that, 'id', {
        get: () => spec.id
    });

    //------------------------------------------------------------------
    //
    // The only update to do is to tell the underlying animated sprite
    // to update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        spec.center.x += (elapsedTime * spec.momentum.x);
        spec.center.y += (elapsedTime * spec.momentum.y);

        spec.timeRemaining -= elapsedTime;

        if (spec.timeRemaining <= 0) {
            return false;
        } else {
            return true;
        }
    };

    return that;
};
