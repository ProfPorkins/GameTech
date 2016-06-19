/* global QuadTreeDemo, Random, QuadTree */
// ------------------------------------------------------------------
//
// This namespace holds the quad-tree demo model.
//
// ------------------------------------------------------------------
QuadTreeDemo.model = (function(components) {
	'use strict';

	var that = {},
		circles = [],
		quadTree = null,
		showQuadTree = true,
		textTests = {
			text : '',
			font : '20px Arial, sans-serif',
			fill : 'rgba(255, 255, 255, 1)',
			pos : { x : 1.05, y : 0.15 }
		},
		textObjects = {
			text : '',
			font : '20px Arial, sans-serif',
			fill : 'rgba(255, 255, 255, 1)',
			pos : { x : 1.05, y : 0.10 }
		};

	// ------------------------------------------------------------------
	//
	// This function initializes the quad-tree demo model.
	//
	// ------------------------------------------------------------------
	that.initialize = function() {
		var circle = 0,
			addCircle = {},
			intersectsAny = false;
		//
		// Randomly generate a bunch of randomly sized circles.
		while (circles.length < components.Constants.NumberOfCircles) {
			addCircle = components.Circle( {
				center: { x: Random.nextDouble(), y: Random.nextDouble() },
				direction: Random.nextCircleVector(0.2),
				radius: Math.max(0.0025, Math.abs(Random.nextGaussian(0.01, 0.005)))
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
			}
		}
	};

	// ------------------------------------------------------------------
	//
	// Toggles the rendering of the quad-tree.
	//
	// ------------------------------------------------------------------
	that.toggleQuadTreeRendering = function() {
		showQuadTree = !showQuadTree;
	};

	// ------------------------------------------------------------------
	//
	// Perform an elastic collision between the two circles to determine
	// their new direction vectors.
	//
	// ------------------------------------------------------------------
	function bounce(c1, c2, elapsedTime) {
		var v1 = { x: 0, y: 0 },
			v2 = { x: 0, y: 0 };

		v1.x = (c1.direction.x * (c1.radius - c2.radius) + 2 * c2.radius * c2.direction.x) / (c1.radius + c2.radius);
		v1.y = (c1.direction.y * (c1.radius - c2.radius) + 2 * c2.radius * c2.direction.y) / (c1.radius + c2.radius);

		v2.x = (c2.direction.x * (c2.radius - c1.radius) + 2 * c1.radius * c1.direction.x) / (c1.radius + c2.radius);
		v2.y = (c2.direction.y * (c2.radius - c1.radius) + 2 * c1.radius * c1.direction.y) / (c1.radius + c2.radius);

		c1.direction = v1;
		c2.direction = v2;

		//
		// Move them along their new direction vectors until they no longer intersect.
		while (c1.intersects(c2)) {
			c1.update(elapsedTime);
			c2.update(elapsedTime);
		}
	}

	// ------------------------------------------------------------------
	//
	// Overlays a rendering of the QuadTree on top of the world.  This is
	// written as a recursive function that performs a pre-order traversal
	// and rendering.
	//
	// ------------------------------------------------------------------
	function renderQuadTree(renderer, node) {
		var child = 0;
		//
		// Recursively (post-order) work through the nodes and draw their bounds on
		// the way down.
		for (child = 0; child < node.children.length; child += 1) {
			renderQuadTree(renderer, node.children[child]);
		}

		//
		// Only necessary to render the leaf nodes, this provides a small rendering
		// optimization.
		if (!node.hasChildren) {
			renderer.drawRectangle(
				'rgba(100, 100, 100, 1)',
				node.left,
				node.top,
				node.size,
				node.size);
		}
	}

	// ------------------------------------------------------------------
	//
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var circle = 0,
			test = 0,
			other = null;

		//
		// Have all the circles update their positions
		for (circle = 0; circle < circles.length; circle += 1) {
			circles[circle].update(elapsedTime);
		}

		//
		// Build a quad tree for collision detection
		quadTree = QuadTree(6);
		for (circle = 0; circle < circles.length; circle += 1) {
			quadTree.insert(circles[circle]);
		}

		//
		// Check for collisions with other circles
		// for (circle = 0; circle < circles.length; circle += 1) {
		// 	for (test = circle; test < circles.length; test += 1) {
		// 		//
		// 		// Don't test against ourselves
		// 		if (circle !== test) {
		// 			if (circles[circle].intersects(circles[test])) {
		// 				//
		// 				// Bounce the circles...this also moves them so they
		// 				// no longer intersect.
		// 				bounce(circles[circle], circles[test], elapsedTime);
		// 			}
		// 		}
		// 	}
		// }

		for (circle = 0; circle < circles.length; circle += 1) {
			other = quadTree.intersects(circles[circle]);
			if (other) {
				bounce(circles[circle], other, elapsedTime);
			}
		}
	};

	// ------------------------------------------------------------------
	//
	// This function renders the demo model.
	//
	// ------------------------------------------------------------------
	that.render = function(renderer) {
		var circle = 0;

		for (circle = 0; circle < circles.length; circle += 1) {
			renderer.drawCircle('rgba(150, 0, 255, 1)', circles[circle].center, circles[circle].radius);
		}

		if (showQuadTree) {
			renderQuadTree(renderer, quadTree.root);
		}

		//
		// Draw a border around the unit world.  Draw this after rendering
		// the QuadTree so that it will draw over the border that happens
		// automatically by the QuadTree...we want this color to show.
		renderer.drawRectangle('rgba(255, 255, 255, 1)', 0, 0, 1, 1);

		//
		// Show some stats about the demo
		textObjects.text = 'objects: ' + circles.length;
		renderer.drawText(textObjects);
		textTests.text = 'tests: ' + quadTree.collisionTests;
		renderer.drawText(textTests);
	};

	return that;

}(QuadTreeDemo.components));
