// ------------------------------------------------------------------
//
// Rendering function for a /Components/Explosion object.
//
// ------------------------------------------------------------------
Demo.renderer.Explosion = (function(core) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Renders an explosion model.
    //
    // ------------------------------------------------------------------
    that.render = function(model) {
        Demo.renderer.AnimatedSprite.render(model.sprite);
    };

    return that;
}(Demo.renderer.core));
