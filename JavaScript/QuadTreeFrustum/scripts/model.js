// ------------------------------------------------------------------
//
// This namespace holds the quad-tree frustum demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
    'use strict';

    let circles = [];
    let quadTree = null;
    let quadTreeCriteria = 6;
    let showQuadTree = true;
    let showEntities = true;
    let moveEntities = true;
    let textObjects = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.10 }
        };
    let textTested = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.13 }
        };
    let textVisible = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.16 }
        };
    let textCriteria = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.19 }
        };
    let camera = null;
    let that = {
            get quadTreeCriteria() { return quadTreeCriteria; },
            set quadTreeCriteria(value) {
                if (value >= 3) {
                    quadTreeCriteria = value;
                    //
                    // When changing the criteria, have to rebuild the quad-tree
                    buildQuadTree();
                }
            }
        };

    // ------------------------------------------------------------------
    //
    // Takes the current set of circles and builds the quad-tree from them.
    //
    // ------------------------------------------------------------------
    function buildQuadTree() {
        let circle = 0;

        quadTree = components.QuadTree(quadTreeCriteria);
        for (circle = 0; circle < circles.length; circle += 1) {
            quadTree.insert(circles[circle]);
        }
    }

    // ------------------------------------------------------------------
    //
    // Internal function used to add more circles to the model.
    //
    // ------------------------------------------------------------------
    function addMoreCircles(howManyCircles) {
        let circle = 0;
        let addCircle = {};
        let intersectsAny = false;
        let addedCircles = 0;
        //
        // Randomly generate a bunch of randomly sized circles.
        while (addedCircles < howManyCircles) {
            addCircle = components.Entity( {
                center: { x: Random.nextDouble(), y: Random.nextDouble() },
                radius: Math.max(0.0015, Math.abs(Random.nextGaussian(0.005, 0.0025))),
                direction: Random.nextCircleVector(0.1)
            } );
            //
            // Don't allow the circle to start overlapped with the edges of the world
            addCircle.center.x = Math.max(addCircle.radius, addCircle.center.x);
            addCircle.center.x = Math.min(1.0 - addCircle.radius, addCircle.center.x);
            addCircle.center.y = Math.max(addCircle.radius, addCircle.center.y);
            addCircle.center.y = Math.min(1.0 - addCircle.radius, addCircle.center.y);
            //
            // Make sure this circle doesn't intersect/overlap with any of our existing
            // circles.
            intersectsAny = false;
            for (circle = 0; circle < circles.length; circle += 1) {
                if (circles[circle].intersects(addCircle)) {
                    intersectsAny = true;
                }
            }
            if (intersectsAny === false) {
                circles.push(addCircle);
                addedCircles += 1;
            }
        }
    }

    // ------------------------------------------------------------------
    //
    // Perform an elastic collision between the two circles to determine
    // their new direction vectors.
    //
    // ------------------------------------------------------------------
    function bounce(c1, c2, elapsedTime) {
        let v1 = { x: 0, y: 0 };
        let v2 = { x: 0, y: 0 };

        v1.x = (c1.direction.x * (c1.radius - c2.radius) + 2 * c2.radius * c2.direction.x) / (c1.radius + c2.radius);
        v1.y = (c1.direction.y * (c1.radius - c2.radius) + 2 * c2.radius * c2.direction.y) / (c1.radius + c2.radius);

        v2.x = (c2.direction.x * (c2.radius - c1.radius) + 2 * c1.radius * c1.direction.x) / (c1.radius + c2.radius);
        v2.y = (c2.direction.y * (c2.radius - c1.radius) + 2 * c1.radius * c1.direction.y) / (c1.radius + c2.radius);

        c1.direction.x = v1.x;
        c1.direction.y = v1.y;
        c2.direction.x = v2.x;
        c2.direction.y = v2.y;

        //
        // Move them along their new direction vectors until they no longer intersect.
        while (c1.intersects(c2)) {
            c1.update(elapsedTime);
            c2.update(elapsedTime);
        }
    }

    // ------------------------------------------------------------------
    //
    // When a resize event occurs, remeasure where things should go.
    //
    // ------------------------------------------------------------------
    function notifyResize() {
        //
        // Figure out the positioning of the text elements
        textObjects.height = Demo.renderer.core.measureTextHeight(textObjects);
        textTested.height = Demo.renderer.core.measureTextHeight(textTested);
        textVisible.height = Demo.renderer.core.measureTextHeight(textVisible);
        textCriteria.height = Demo.renderer.core.measureTextHeight(textCriteria);

        textTested.position.y = textObjects.position.y + textObjects.height + 0.01;
        textVisible.position.y = textTested.position.y + textTested.height + 0.01;
        textCriteria.position.y = textVisible.position.y + textVisible.height + 0.01;
    }

    // ------------------------------------------------------------------
    //
    // This function initializes the quad-tree demo model.  Only thing it
    // does right now is to add the circles to the model.
    //
    // ------------------------------------------------------------------
    that.initialize = function(howManyCircles) {
        Demo.renderer.core.notifyResize(notifyResize);
        addMoreCircles(howManyCircles);

        buildQuadTree();

        //
        // Define the initial camera position.  Place it in the center of the
        // area, looking towards the top.
        camera = components.Camera({
            position:  {
                x: 0.5,
                y: 0.5
            },
            direction: (Math.PI / 2) * 3,
            fieldOfView: Math.PI / 4,
            viewDistance: 0.2
        });
    };

    // ------------------------------------------------------------------
    //
    // Public member that allows a number circles to be added to the model.
    //
    // ------------------------------------------------------------------
    that.addCircles = function(howManyCircles) {
        addMoreCircles(howManyCircles);

        //
        // Have to rebuild the quad-tree when adding circles.
        buildQuadTree();
    };

    // ------------------------------------------------------------------
    //
    // Public member that allows a number of circles to be removed.
    //
    // ------------------------------------------------------------------
    that.removeCircles = function(howManyCircles) {
        //
        // Just change the length of the circles array to remove the
        // requested circles...easiest way to do this.
        circles.length = Math.max(0, circles.length - howManyCircles);

        //
        // Have to rebuild the quad-tree when removing circles.
        buildQuadTree();
    };

    // ------------------------------------------------------------------
    //
    // Toggles the rendering of the QuadTree.
    //
    // ------------------------------------------------------------------
    that.toggleQuadTreeRendering = function() {
        showQuadTree = !showQuadTree;
    };

    // ------------------------------------------------------------------
    //
    // Toggles the rendering of the Entities.
    //
    // ------------------------------------------------------------------
    that.toggleEntityRendering = function() {
        showEntities = !showEntities;
    };

    // ------------------------------------------------------------------
    //
    // Toggles the movement of the Entities.
    //
    // ------------------------------------------------------------------
    that.toggleEntityMovement = function() {
        moveEntities = !moveEntities;
    };

    // ------------------------------------------------------------------
    //
    // Move the camera forward.
    //
    // ------------------------------------------------------------------
    that.cameraMoveForward = function(elapsedTime) {
        camera.moveForward(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Move the camera backward.
    //
    // ------------------------------------------------------------------
    that.cameraMoveBackward = function(elapsedTime) {
        camera.moveBackward(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Rotate the camera left.
    //
    // ------------------------------------------------------------------
    that.cameraRotateLeft = function(elapsedTime) {
        camera.rotateLeft(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Rotate the camera right.
    //
    // ------------------------------------------------------------------
    that.cameraRotateRight = function(elapsedTime) {
        camera.rotateRight(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Decrease the camera Field of View.
    //
    // ------------------------------------------------------------------
    that.cameraDecreaseFOV = function(elapsedTime) {
        camera.decreaseFOV(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Increase the camera Field of View.
    //
    // ------------------------------------------------------------------
    that.cameraIncreaseFOV = function(elapsedTime) {
        camera.increaseFOV(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Increase the view distance.
    //
    // ------------------------------------------------------------------
    that.cameraIncreaseDepth = function(elapsedTime) {
        camera.increaseDepth(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // Decrease the view distance.
    //
    // ------------------------------------------------------------------
    that.cameraDecreaseDepth = function(elapsedTime) {
        camera.decreaseDepth(elapsedTime);
    };

    // ------------------------------------------------------------------
    //
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let circle = 0;
        let other = null;

        if (moveEntities) {
            //
            // Have all the circles update their positions
            for (circle = 0; circle < circles.length; circle += 1) {
                circles[circle].update(elapsedTime);
            }

            buildQuadTree();

            for (circle = 0; circle < circles.length; circle += 1) {
                other = quadTree.intersects(circles[circle]);
                if (other) {
                    bounce(circles[circle], other, elapsedTime);
                }
            }
        }
    };

    // ------------------------------------------------------------------
    //
    // This function renders the demo model.
    //
    // ------------------------------------------------------------------
    that.render = function(renderer) {
        let circle = 0;
        let visible = [];

        if (showEntities) {
            for (circle = 0; circle < circles.length; circle += 1) {
                renderer.core.drawCircle('rgba(150, 0, 255, 1)', circles[circle].center, circles[circle].radius);
            }
        }

        if (showQuadTree) {
            renderer.QuadTree.render(quadTree);
        }

        renderer.Camera.render(camera);

        //
        // Find the objects contained with the frustum view and render them!
        visible = quadTree.visibleObjects(camera);
        for (circle = 0; circle < visible.length; circle += 1) {
            renderer.core.drawCircle('rgba(0, 255, 0, 1)', visible[circle].center, visible[circle].radius);
        }

        //
        // Draw a border around the unit world.  Draw this after rendering
        // the QuadTree so that it will draw over the border that happens
        // automatically by the QuadTree...we want this color to show.
        renderer.core.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

        //
        // Show some stats about the demo
        textObjects.text = 'objects: ' + circles.length;
        renderer.core.drawText(textObjects);
        textTested.text = 'objects tested: ' + quadTree.objectsTested;
        renderer.core.drawText(textTested);
        textVisible.text = 'objects visible: ' + visible.length;
        renderer.core.drawText(textVisible);
        textCriteria.text = 'quad-tree criteria: ' + quadTreeCriteria;
        renderer.core.drawText(textCriteria);
    };

    return that;

}(Demo.components));
