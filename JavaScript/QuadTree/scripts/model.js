// ------------------------------------------------------------------
//
// This namespace holds the quad-tree demo model.
//
// ------------------------------------------------------------------
Demo.model = (function(components) {
    'use strict';

    let circles = [];
    let useQuadTree = true;
    let quadTree = null;
    let quadTreeCriteria = 6;
    let showQuadTree = true;
    let showEntities = true;
    let moveEntities = true;
    let intersectionTests = 0;
    let textObjects = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.10 }
        };
    let textTests = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.13 }
        };
    let textCriteria = {
            text : '',
            font : '16px Arial, sans-serif',
            fill : 'rgba(200, 200, 255, 1)',
            position : { x : 1.025, y : 0.16 }
        };
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
                radius: Math.max(0.0025, Math.abs(Random.nextGaussian(0.01, 0.005))),
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
        textTests.height = Demo.renderer.core.measureTextHeight(textTests);
        textCriteria.height = Demo.renderer.core.measureTextHeight(textCriteria);

        textTests.position.y = textObjects.position.y + textObjects.height + 0.01;
        textCriteria.position.y = textTests.position.y + textTests.height + 0.01;
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
    // Toggles the use of the QuadTree or n x n collision detection.
    //
    // ------------------------------------------------------------------
    that.toggleUseQuadTree = function() {
        useQuadTree = !useQuadTree;
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
    // This function is used to update the state of the demo model.
    //
    // ------------------------------------------------------------------
    that.update = function(elapsedTime) {
        let circle = 0;
        let test = 0;
        let other = null;

        if (moveEntities) {
            //
            // Have all the circles update their positions
            for (circle = 0; circle < circles.length; circle += 1) {
                circles[circle].update(elapsedTime);
            }

            if (useQuadTree) {
                buildQuadTree();
                //
                // Check for collisions with other circles
                for (circle = 0; circle < circles.length; circle += 1) {
                    other = quadTree.intersects(circles[circle]);
                    if (other) {
                        bounce(circles[circle], other, elapsedTime);
                    }
                }
                intersectionTests = quadTree.intersectionTests;
            } else {
                //
                // Check for collisions with other circles
                intersectionTests = 0;
                for (circle = 0; circle < circles.length; circle += 1) {
                    for (test = circle; test < circles.length; test += 1) {
                        //
                        // Don't test against ourselves
                        if (circle !== test) {
                            intersectionTests += 1;
                            if (circles[circle].intersects(circles[test])) {
                                //
                                // Bounce the circles...this also moves them so they
                                // no longer intersect.
                                bounce(circles[circle], circles[test], elapsedTime);
                            }
                        }
                    }
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

        if (showEntities) {
            for (circle = 0; circle < circles.length; circle += 1) {
                renderer.core.drawCircle('rgba(150, 0, 255, 1)', circles[circle].center, circles[circle].radius);
            }
        }

        if (useQuadTree && showQuadTree) {
            renderer.QuadTree.render(quadTree);
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
        textTests.text = 'intersection tests: ' + intersectionTests;
        renderer.core.drawText(textTests);
        textCriteria.text = 'quad-tree criteria: ' + quadTreeCriteria;
        renderer.core.drawText(textCriteria);
    };

    return that;

}(Demo.components));
