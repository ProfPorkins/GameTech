//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//  {
//      image: ,                        // image to use for rendering
//      size: { width: , height: },     // In world coordinates
//      state: {    // Current state of the ship within the update window (or beyond if no data)
//          direction: ,                // In Radians
//          center: { x: , y: }         // In world coordinates
//      },
//      state: {    // Where the ship started for the update window
//          direction: ,                // In Radians
//          center: { x: , y: }         // In world coordinates
//          momentum: { x: , y: }       // In world units
//      },
//      goal: {     // Where the ship should end for the update window
//          direction: ,                // In Radians
//          center: { x: , y: },        // In world coordinates
//          updateWindow:               // Server reported tiem elapsed since last update
//      }
//  }
//
//------------------------------------------------------------------
Demo.components.SpaceShipRemote = function(spec) {
    'use strict';
    let that = {};

    //
    // Get our sprite model
    let sprite = Demo.components.Sprite({
        image: spec.image,
        spriteSize: spec.size,              // Maintain the size on the sprite
        spriteCenter: spec.state.center     // Maintain the center on the sprite
    });

    Object.defineProperty(that, 'state', {
        get: () => spec.state
    });

    Object.defineProperty(that, 'start', {
        get: () => spec.start
    });

    Object.defineProperty(that, 'goal', {
        get: () => spec.goal
    });

    Object.defineProperty(that, 'size', {
        get: () => spec.size
    });

    Object.defineProperty(that, 'sprite', {
        get: () => sprite
    });

    // Provided so the same SpaceShip renderer can be used for this component
    Object.defineProperty(that, 'direction', {
        get: () => spec.state.direction
    });

    // Provided so the same SpaceShip renderer can be used for this component
    Object.defineProperty(that, 'center', {
        get: () => spec.state.center
    });

    //------------------------------------------------------------------
    //
    // Update of the remote player is a simple linear progression/interpolation
    // from the previous state to the goal (new) state.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        // Protect against divide by 0 before the first update from the server has been given
        if (spec.goal.updateWindow === 0) return;
        if (spec.goal.updatedTime < spec.goal.updateWindow) {
            spec.goal.updatedTime += elapsedTime;

            let updateFraction = elapsedTime / spec.goal.updateWindow;
            //
            // Only interpolate turning
            spec.state.direction -= (spec.start.direction - spec.goal.direction) * updateFraction;
        }

        //
        // Predict position from momentum
        spec.state.center.x += (spec.state.momentum.x * elapsedTime);
        spec.state.center.y += (spec.state.momentum.y * elapsedTime);
    };
    //
    // This version interplolates to the last location provided by the server
    // as a way to ensure the remote players are in the right spot at some point.
    //
    /* that.update = function(elapsedTime) {
        // Protect against divide by 0 before the first update from the server has been given
        if (spec.goal.updateWindow === 0) return;
        if (spec.goal.updatedTime < spec.goal.updateWindow) {
            spec.goal.updatedTime += elapsedTime;

            let updateFraction = elapsedTime / spec.goal.updateWindow;
            //
            // Turn first, then move.
            spec.state.direction -= (spec.start.direction - spec.goal.direction) * updateFraction;

            spec.state.center.x -= (spec.start.center.x - spec.goal.center.x) * updateFraction;
            spec.state.center.y -= (spec.start.center.y - spec.goal.center.y) * updateFraction;
        } else {
            // Ship is only floating along, need to update is position
            spec.state.center.x += (spec.state.momentum.x * elapsedTime);
            spec.state.center.y += (spec.state.momentum.y * elapsedTime);
        }
    }; */

    return that;
};
