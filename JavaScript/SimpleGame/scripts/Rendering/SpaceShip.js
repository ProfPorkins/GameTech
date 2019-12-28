// ------------------------------------------------------------------
//
// Rendering function for a /Components/SpaceShip object.
//
// ------------------------------------------------------------------
Demo.renderer.SpaceShip = (function(core) {
    'use strict';
    let that = {};
    let healthBarHeight = 0.006;

    // ------------------------------------------------------------------
    //
    // Renders a Spaceship model.  Because the model can be rotated, that needs
    // to be done here, because the underlying sprite doesn't know
    // anything about orientation.
    //
    // ------------------------------------------------------------------
    that.render = function(model) {
        let percentGreen = model.hitPoints.strength / model.hitPoints.max;

        core.saveContext();
        core.rotateCanvas(model.center, model.orientation);

        Demo.renderer.Sprite.render(model.sprite);

        //
        // This undoes the rotation very quickly
        core.restoreContext();

        //
        // Render a little bar above the spaceship that represents the health
        // of the ship.
        Demo.renderer.core.drawRectangle(
            'rgba(0, 0, 0, 255)',
            model.center.x - model.size.width / 2, model.center.y - (model.size.height / 2 + healthBarHeight * 2),
            model.size.width, healthBarHeight,
            true);

        //
        // Fill the whole thing with red
        Demo.renderer.core.drawFilledRectangle(
            'rgba(255, 0, 0, 255)',
            model.center.x - model.size.width / 2, model.center.y - (model.size.height / 2 + healthBarHeight * 2),
            model.size.width, healthBarHeight,
            true);

        //
        // Cover up with the green portion
        Demo.renderer.core.drawFilledRectangle(
            'rgba(0, 255, 0, 255)',
            model.center.x - model.size.width / 2, model.center.y - (model.size.height / 2 + healthBarHeight * 2),
            model.size.width * percentGreen, healthBarHeight,
            true);
    };

    return that;
}(Demo.renderer.core));
