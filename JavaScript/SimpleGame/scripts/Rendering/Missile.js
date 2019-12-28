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
    // Renders a Missile model.  Because the model can be rotated, that needs
    // to be done here, because the underlying sprite doesn't know
    // anything about orientation.
    //
    // ------------------------------------------------------------------
    that.render = function(model) {
        core.saveContext();
        core.rotateCanvas(model.center, model.orientation);

        Demo.renderer.Sprite.render(model.sprite);

        //
        // This undoes the rotation very quickly
        core.restoreContext();
    };

    return that;
}(Demo.renderer.core));
