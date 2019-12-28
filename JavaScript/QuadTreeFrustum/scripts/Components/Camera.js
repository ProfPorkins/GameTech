//------------------------------------------------------------------
//
// Defines a 2D viewing camera.
//
//------------------------------------------------------------------
Demo.components.Camera = function(spec) {
    'use strict';
    let frustum = {
            leftPoint: { x: 0, y: 0 },
            rightPoint: { x: 0, y: 0 }
        };
    let boundingCircle = {};
    let that = {
            get position() { return spec.position; },
            get direction() { return spec.direction; },
            get FOV() { return spec.fieldOfView; },
            get viewDistance() { return spec.viewDistance; },
            get frustum() { return frustum; },
            get boundingCircle() { return boundingCircle; }
        };

    //------------------------------------------------------------------
    //
    // Compute the far, left, and right line segments based upon the
    // camera parameters.
    //
    // The length of the vector we are interested in is the hypotenuse
    // of a right triangle.  The formulate to compute the length of
    // the hypotenuse given the angle A and length of the adjacent side
    // is: hypotenuse = adjacent / cos A
    //
    //------------------------------------------------------------------
    function computeFrustum() {
        let leftAngle = spec.direction - spec.fieldOfView / 2;
        let rightAngle = spec.direction + spec.fieldOfView / 2;
        let hypotenuse = spec.viewDistance / Math.cos(spec.fieldOfView / 2);

        frustum.leftPoint.x = spec.position.x + hypotenuse * Math.cos(leftAngle);
        frustum.leftPoint.y = spec.position.y + hypotenuse * Math.sin(leftAngle);
        frustum.rightPoint.x = spec.position.x + hypotenuse * Math.cos(rightAngle);
        frustum.rightPoint.y = spec.position.y + hypotenuse * Math.sin(rightAngle);

        boundingCircle = Demo.utilities.math.circleFromTriangle(spec.position, frustum.rightPoint, frustum.leftPoint);
    }

    //------------------------------------------------------------------
    //
    // Move the camera forward based on its direction, speed, and elapsed time.
    //
    //------------------------------------------------------------------
    that.moveForward = function(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.direction);
        let vectorY = Math.sin(spec.direction);
        //
        // With the normalized direction vector, move the center of the sprite
        spec.position.x += (vectorX * spec.speed * (elapsedTime / 1000));
        spec.position.y += (vectorY * spec.speed * (elapsedTime / 1000));

        computeFrustum();
    };

    //------------------------------------------------------------------
    //
    // Move the camera backwards based on its direction, speed, and elapsed time.
    //
    //------------------------------------------------------------------
    that.moveBackward = function(elapsedTime) {
        //
        // Create a normalized direction vector
        let vectorX = Math.cos(spec.direction);
        let vectorY = Math.sin(spec.direction);
        //
        // With the normalized direction vector, move the center of the sprite
        spec.position.x -= (vectorX * spec.speed * (elapsedTime / 1000));
        spec.position.y -= (vectorY * spec.speed * (elapsedTime / 1000));

        computeFrustum();
    };

    //------------------------------------------------------------------
    //
    // Rotate the camera left based on rotate rate and elapsed time.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        spec.direction -= spec.rotateRate * (elapsedTime / 1000);

        computeFrustum();
    };

    //------------------------------------------------------------------
    //
    // Rotate the camera right based on rotate rate and elapsed time.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        spec.direction += spec.rotateRate * (elapsedTime / 1000);

        computeFrustum();
    };

    that.decreaseFOV = function(elapsedTime) {
        spec.fieldOfView -= spec.fovRate * (elapsedTime / 1000);

        computeFrustum();
    };

    that.increaseFOV = function(elapsedTime) {
        spec.fieldOfView += spec.fovRate * (elapsedTime / 1000);

        computeFrustum();
    };

    that.increaseDepth = function(elapsedTime) {
        spec.viewDistance += spec.viewDistanceRate * (elapsedTime / 1000);

        computeFrustum();
    };

    that.decreaseDepth = function(elapsedTime) {
        spec.viewDistance -= spec.viewDistanceRate * (elapsedTime / 1000);

        computeFrustum();
    };

    //
    // Add a movement and rotation rate into the spec
    spec.speed = 0.20;    // World units per second
    spec.rotateRate = Math.PI / 2;    // Radians per second
    spec.fovRate = Math.PI / 4;        // Radians per second
    spec.viewDistanceRate = 0.1;    // World units per second

    //
    // During initialization, compute the viewing frustum based upon
    // the camera parameters
    computeFrustum();

    return that;
};
