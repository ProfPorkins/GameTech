// ------------------------------------------------------------------
//
// Rendering function for a /Components/Missile object.
//
// ------------------------------------------------------------------
Demo.renderer.Missile = (function(core) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders a Missile model.
    //
    // ------------------------------------------------------------------
    that.render = function(model) {
        core.drawFilledCircle('#FFFFFF', model.center, model.radius);
    };

    return that;

}(Demo.renderer.core));
