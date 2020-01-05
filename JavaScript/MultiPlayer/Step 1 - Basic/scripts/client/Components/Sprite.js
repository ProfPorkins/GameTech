//------------------------------------------------------------------
//
// Defines a simple sprite object.  The spec is defined as:
// {
//        image: Image,
//        spriteSize: { x: , y: },            // In world coordinates
//        spriteCenter: { x: , y: },            // In world coordinates
// }
//
//------------------------------------------------------------------
Demo.components.Sprite = function(spec) {
    'use strict';
    let that = {
        get image() { return spec.image; },
        get pixelWidth() { return spec.image.width; },
        get pixelHeight() { return spec.image.height; },
        get width() { return spec.spriteSize.width; },
        get height() { return spec.spriteSize.height; },
        get center() { return spec.spriteCenter; }
    };

    //------------------------------------------------------------------
    //
    // There is no update necessary on a sprite.
    //
    //------------------------------------------------------------------
    that.update = function() {
        //
        // Nothing to do here.
    };

    return that;
};
