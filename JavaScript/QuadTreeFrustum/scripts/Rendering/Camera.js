// ------------------------------------------------------------------
//
// Rendering function for a /Components/Camera object.
//
// ------------------------------------------------------------------
Demo.renderer.Camera = (function(core) {
    'use strict';
    let that = {};

    that.render = function(camera) {
        //
        // Draw a tiny little circle a the position of the camera
        core.drawCircle('rgba(255, 255, 0, 1)', camera.position, 0.005);
        //
        // Draw the left, right, and far plane line segments
        core.drawLine('rgba(255, 255, 0, 1)', camera.position, camera.frustum.leftPoint);
        core.drawLine('rgba(255, 255, 0, 1)', camera.position, camera.frustum.rightPoint);
        core.drawLine('rgba(255, 255, 0, 1)', camera.frustum.leftPoint, camera.frustum.rightPoint);

        //
        // Draw the bounding circle
        // core.drawCircle(
        //     'rgba(255, 255, 0, 1)',
        //     camera.boundingCircle.center,
        //     camera.boundingCircle.radius);
        //
        // Draw a tiny circle to show the bounding circle center
        // core.drawCircle(
        //     'rgba(255, 255, 0, 1)',
        //     camera.boundingCircle.center,
        //     0.005);
    };

    return that;
}(Demo.renderer.core));
