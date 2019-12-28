// ------------------------------------------------------------------
//
// Rendering function for a /Components/Base object.
//
// ------------------------------------------------------------------
Demo.renderer.Base = (function(core) {
    'use strict';
    let that = {};
    let healthBarHeight = 0.006;

    // ------------------------------------------------------------------
    //
    // Renders a Base model.  Because the model can be rotated, that needs
    // to be done here, because the underlying sprite doesn't know
    // anything about orientation.
    //
    // ------------------------------------------------------------------
    that.render = function(model, elapsedTime) {
        let percentGreen = model.hitPoints.strength / model.hitPoints.max;

        core.saveContext();
        core.rotateCanvas(model.center, model.orientation);

        //
        // First, render the surrounding shield (if it exists)
        if (model.shield.strength > 0) {
            let shieldStrength = 0.25 + (model.shield.strength / model.shield.max) * 0.50;
            Demo.renderer.core.drawFilledCircle(
                'rgba(0, 0, 255,' + shieldStrength + ')',
                model.center,
                model.shield.radius, true);
        }
        //
        // Next, draw the main base
        Demo.renderer.Sprite.render(model.sprite);

        //
        // This undoes the rotation very quickly
        core.restoreContext();

        //
        // Render a little bar above the spaceship that represents the health
        // of the ship.
        Demo.renderer.core.drawRectangle(
            'rgba(0, 0, 0, 255)',
            model.center.x - model.radius / 2, model.center.y - healthBarHeight / 2,
            model.radius, healthBarHeight,
            true);

        //
        // Fill the whole thing with red
        Demo.renderer.core.drawFilledRectangle(
            'rgba(255, 0, 0, 255)',
            model.center.x - model.radius / 2, model.center.y - healthBarHeight / 2,
            model.radius, healthBarHeight,
            true);

        //
        // Cover up with the green portion
        Demo.renderer.core.drawFilledRectangle(
            'rgba(0, 255, 0, 255)',
            model.center.x - model.radius / 2, model.center.y - healthBarHeight / 2,
            model.radius * percentGreen, healthBarHeight,
            true);
    };

    return that;
}(Demo.renderer.core));
