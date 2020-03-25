// ------------------------------------------------------------------
//
// Rendering function for a /Components/Text object.
//
// ------------------------------------------------------------------
Demo.renderer.Text = (function(core) {
    'use strict';
    let that = {};

    that.render = function(text) {
        core.drawText(text);
    };

    return that;
}(Demo.renderer.core));
