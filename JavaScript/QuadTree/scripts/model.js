/* global QuadTreeDemo, Random, QuadTree */
// ------------------------------------------------------------------
//
// This namespace holds the quad-tree demo model.
//
// ------------------------------------------------------------------
QuadTreeDemo.model = (function(components) {
	'use strict';

	var that = {},
		circles = [];

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
				radius: Math.max(0.005, Math.abs(Random.nextGaussian(0.025, 0.015)))
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

				console.log('x: ' + addCircle.center.x);
				console.log('y: ' + addCircle.center.y);
				console.log('direction: ' + addCircle.direction.x + ', ' + addCircle.direction.y);
				console.log('radius: ' + addCircle.radius);
			}
		}
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
	// This function is used to update the state of the demo model.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var circle = 0,
			test = 0,
			quadTree = QuadTree(6);
		//
		// Have all the circles update their positions
		for (circle = 0; circle < circles.length; circle += 1) {
			circles[circle].update(elapsedTime);
		}

		//
		// Build a quad tree for collision detection
		for (circle = 0; circle < circles.length; circle += 1) {
			quadTree.insert(circles[circle]);
		}
		//
		// Check for collisions with other circles
		for (circle = 0; circle < circles.length; circle += 1) {
			for (test = circle; test < circles.length; test += 1) {
				//
				// Don't test against ourselves
				if (circle !== test) {
					if (circles[circle].intersects(circles[test])) {
						//
						// Bounce the circles...this also moves them so they
						// no longer intersect.
						bounce(circles[circle], circles[test], elapsedTime);
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
		var circle = 0;

		//
		// Draw a border around the unit world
		renderer.drawRectangle(0, 0, 1, 1);

		for (circle = 0; circle < circles.length; circle += 1) {
			renderer.drawCircle(circles[circle].center, circles[circle].radius);
		}
	};

	return that;

}(QuadTreeDemo.components));
