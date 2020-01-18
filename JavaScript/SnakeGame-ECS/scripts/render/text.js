// ------------------------------------------------------------------
//
// Rendering function for a /components/text object.
//
// ------------------------------------------------------------------
Demo.graphics.Text = (function(graphics) {
    'use strict';
    let that = {};

    that.render = function(text) {
        graphics.core.drawText(text);
    };

    return that;
}(Demo.graphics));
