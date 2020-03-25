// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a missile.
//
// ------------------------------------------------------------------
'use strict';

//------------------------------------------------------------------
//
// Public function used to initially create a newly fired missile.
//
//------------------------------------------------------------------
function createMissile(spec) {
    let that = {};

    Object.defineProperty(that, 'clientId', {
        get: () => spec.clientId
    });

    Object.defineProperty(that, 'id', {
        get: () => spec.id
    });

    Object.defineProperty(that, 'momentum', {
        get: () => spec.momentum
    });

    Object.defineProperty(that, 'center', {
        get: () => spec.center
    });

    Object.defineProperty(that, 'radius', {
        get: () => spec.radius
    });

    Object.defineProperty(that, 'timeRemaining', {
        get: () => spec.timeRemaining
    });

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
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
}

module.exports.create = (spec) => createMissile(spec);
