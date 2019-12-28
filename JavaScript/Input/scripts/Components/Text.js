//------------------------------------------------------------------
//
// Defines a text object.  The spec is defined as:
//    {
//        text: '',
//        font: '',
//        fill: '',
//        position: { x: , y: }
//    }
//
//------------------------------------------------------------------
Demo.components.Text = function(spec) {
    'use strict';
    let that = {
        get text() { return spec.text; },
        set text(value) { spec.text = value; },
        get font() { return spec.font; },
        get fill() { return spec.fill; },
        get position() { return spec.position; },
    };

    return that;
};
