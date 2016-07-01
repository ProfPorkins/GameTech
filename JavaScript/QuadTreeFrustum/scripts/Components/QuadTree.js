/* global Demo */

// ------------------------------------------------------------------
//
// This is a creator function used to generate a new and empty QuadTree.
//
// ------------------------------------------------------------------
Demo.components.QuadTree = function(maxMembership) {
	'use strict';

	var root = null,
		nextItemId = 0,
		testedSet = {},
		that = {
			get root() { return root; },
			get depth() { return findDepth(root); },
			get objectsTested() { return Object.keys(testedSet).length; }
		};

	// ------------------------------------------------------------------
	//
	// Creator function used to generate a node for the QuadTree.  This is
	// where most of the work takes place, particularly in the 'add' function
	// where the splitting of nodes happens.
	//
	// ------------------------------------------------------------------
	function Node(bounds) {
		var	children = [],	// Child nodes of this node
			members = [],	// List of items contained within this node
			boundingCircle = {},
			circleSpec = {},
			node = {
				get left() { return bounds.left; },
				get top() { return bounds.top; },
				get size() { return bounds.size; },
				get isFull() { return members.length >= maxMembership; },
				get hasChildren() { return children.length > 0; },
				get children() { return children; },
				get members() { return members; },
				get boundingCircle() { return boundingCircle; }
			};

		//
		// When creating a node, define a bounding circle that we can use for
		// quick intersection tests with other circles before dropping down to
		// do the slower test against the square.
		circleSpec.center = {
			x: bounds.left + bounds.size / 2,
			y: bounds.top + bounds.size / 2
		};
		circleSpec.radius = Math.sqrt(Math.pow(circleSpec.center.x - bounds.left, 2) + Math.pow(circleSpec.center.y - bounds.top, 2));
		boundingCircle = Demo.components.Circle(circleSpec);

		// ------------------------------------------------------------------
		//
		// Adds a new item to the node.  If the node is full, it is split and
		// its children then distributed to the split nodes.
		//
		// ------------------------------------------------------------------
		node.add = function(item) {
			var child1 = null,
				child2 = null,
				child3 = null,
				child4 = null,
				member = 0;
			//
			// If the node is already full, then have to split and distribute
			// all of the items in the node to the newly created child nodes.
			if (node.isFull) {
				//
				// Create the four child nodes, evenly splitting the area covered by this node
				// amoung the new child nodes.
				child1 = Node({		// Top, left
					left: bounds.left,
					top: bounds.top,
					size: bounds.size / 2
				});
				child2 = Node({		// Top, right
					left: bounds.left + bounds.size / 2,
					top: bounds.top,
					size: bounds.size / 2
				});
				child3 = Node({		// Bottom, left
					left: bounds.left,
					top: bounds.top + bounds.size / 2,
					size: bounds.size / 2
				});
				child4 = Node({		// Bottom right
					left: bounds.left + bounds.size / 2,
					top: bounds.top + bounds.size / 2,
					size: bounds.size / 2
				});
				children.push(child1);
				children.push(child2);
				children.push(child3);
				children.push(child4);
				//
				// With the new child nodes in place, distribute the members contained within
				// this node over the children.
				for (member = 0; member < node.members.length; member += 1) {
					insert(node, members[member]);
				}
				//
				// Finally, get the new item inserted in the correct location.
				insert(node, item);
			} else {
				members.push(item);
			}
		};

		return node;
	}

	// ------------------------------------------------------------------
	//
	// Recursive function used to add a new node to the QuadTree.  Splitting
	// of nodes will automatically happen within the node itself, not here,
	// making this a relatively simple function.
	//
	// ------------------------------------------------------------------
	function insert(node, item) {
		var child = 0;
		//
		// See if the item (a circle) is inside of this node (a square), if it isn't then nothing to do.
		if (Demo.utilities.math.circleTouchSquare(item, node)) {
			//
			// If this node has children, then crawl through them to see which of them
			// the new item belongs; keeping in mind, it may have membership in more
			// than one child.
			if (node.hasChildren) {
				for (child = 0; child < node.children.length; child += 1) {
					insert(node.children[child], item);
				}
			} else {
				node.add(item);
			}
		}
	}

	// ------------------------------------------------------------------
	//
	// Public member used to allow an item to be added to the QuadTree.
	//
	// ------------------------------------------------------------------
	that.insert = function(item) {
		//
		// We give each new item a unique id because they can have membership in
		// more than one leaf node.  When we are doing frustum visibility testing, this
		// id can be used to see if we've already looked at the item or not.
		item.id = nextItemId;
		nextItemId += 1;
		//
		// Call the recursive 'insert' to perform the work of actually
		// adding the new item to the QuadTree.
		insert(root, item);
	};

	// ------------------------------------------------------------------
	//
	// Determines if 'item' intersects with any other item contained within
	// the QuadTree.  If it does, the other item is returned, otherwise null
	// is returned.
	//
	// ------------------------------------------------------------------
	function intersects(node, item) {
		var child = 0,
			member = 0,
			hitMe = null;

		if (Demo.utilities.math.circleTouchSquare(item, node)) {
			if (node.hasChildren) {
				//
				// Not a leaf node, recurse into its children
				for (child = 0; child < node.children.length; child += 1) {
					hitMe = hitMe || intersects(node.children[child], item);
					if (hitMe) {
						break;
					}
				}
			} else {
				//
				// This is a leaf node, test against all members of this node.
				for (member = 0; member < node.members.length; member += 1) {
					if (item !== node.members[member]) {
						if (node.members[member].intersects(item)) {
							hitMe = node.members[member];
							break;	// Go ahead and stop at the first one found
						}
					}
				}
			}
		}

		//
		// If we get this far, then we didn't intersect with anything.
		return hitMe;
	}

	// ------------------------------------------------------------------
	//
	// Public member to allow client code to test if 'item' intersects any
	// other object in the QuadTree.
	//
	// ------------------------------------------------------------------
	that.intersects = function(item) {
		var other = null;

		//
		// Start working down through the QuadTree to find which leaf node(s)
		// this item overlaps and then test against everything in those node(s).
		other = intersects(root, item);

		return other;
	};

	// ------------------------------------------------------------------
	//
	// Recursive function that does the work of finding out which objects
	// are visible to the viewing frustum.
	//
	// ------------------------------------------------------------------
	function queryVisible(node, camera, triangle, visible) {
		var child = 0,
			member = 0,
			item = null;
		//
		// Do the simple circle-circle test first, if that passes, then
		// do the more complex circle-square test.
		if (node.boundingCircle.intersects(camera.boundingCircle)) {
			if (Demo.utilities.math.circleTouchSquare(camera.boundingCircle, node)) {
				//
				// If this is a leaf node check all of its members to see if they
				// are visible.  Otherwise, if it isn't a leave node recurse into
				// its children.
				if (node.hasChildren) {	// Not a leaf node
					for (child = 0; child < node.children.length; child += 1) {
						queryVisible(node.children[child], camera, triangle, visible);
					}
				} else {	// Is a leaf node
					for (member = 0; member < node.members.length; member += 1) {
						item = node.members[member];
						//
						// Check to see if we have already tested the object.  If we have, no need
						// to check it again.
						if ((item.id in testedSet) === false) {
							testedSet[item.id] = true;
							if (item.intersects(camera.boundingCircle)) {
								if (Demo.utilities.math.circleTouchTriangle(item, triangle)) {
									visible.push(item);
								}
							}
						}
					}
				}
			}
		}
	}

	// ------------------------------------------------------------------
	//
	// Public member that returns a set of the objects visible within
	// the viewing frustum.
	//
	// ------------------------------------------------------------------
	that.visibleObjects = function(camera) {
		var visible = [],
			triangle = {
				pt1: camera.position,
				pt2: camera.frustum.leftPoint,
				pt3: camera.frustum.rightPoint
			};

		testedSet = {};
		queryVisible(root, camera, triangle, visible);

		return visible;
	};

	// ------------------------------------------------------------------
	//
	// Computes the max depth of the QuadTree.
	//
	// ------------------------------------------------------------------
	function findDepth(node) {
		var depth0 = 0,
			depth1 = 0,
			depth2 = 0,
			depth3 = 0;

		if (node.hasChildren) {
			depth0 = findDepth(node.children[0]);
			depth1 = findDepth(node.children[1]);
			depth2 = findDepth(node.children[2]);
			depth3 = findDepth(node.children[3]);

			return 1 + Math.max(Math.max(depth0, depth1), Math.max(depth2, depth3));
		}

		return 1;
	}

	//
	// Initialize the QuadTree with a root node that has no children and covers
	// the full unit world bounds 0 to 1 in both dimensions.
	root = Node( {
		left: 0,
		top: 0,
		size: 1.0
	});

	return that;
};
