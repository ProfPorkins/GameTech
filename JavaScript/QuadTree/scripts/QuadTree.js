// ------------------------------------------------------------------
//
// This is a creator function used to generate a new and empty QuadTree.
//
// ------------------------------------------------------------------
function QuadTree(maxMembership) {
	var that = {},
		root = null;

	// ------------------------------------------------------------------
	//
	// Creator function used to generate a node for the QuadTree.  This is
	// where most of the work takes place, particularly in the 'add' function
	// where the splitting of nodes happens.
	//
	// ------------------------------------------------------------------
	function Node(bounds) {
		var children = [],
			node = {
				get left() { return bounds.left; },
				get top() { return bounds.top; },
				get width() { return bounds.width; },
				get height() { return bounds.height; },
				get isFull() { return children.count >= maxMembership; },
				get hasChildren() { return children.count > 0; },
				get children() { return children; }
			};

		// ------------------------------------------------------------------
		//
		// Adds a new item to the node.  If the node is full, it is split and
		// its children then distributed to the split nodes.
		//
		// ------------------------------------------------------------------
		node.add = function(item) {
			//
			// If the node is already full, then have to split and distribute
			// all of the items in the node to the newly created child nodes.
			if (node.isFull) {

			} else {
				children.push(item);
			}
		};

		return node;
	}

	root = Node( {
		left: 0,
		top: 0,
		width: 1.0,
		height: 1.0
	});

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
		// See if the item is inside of this node, if it isn't then nothing to do.
		if (item.insideSquare(node)) {
			//
			// If this node has children, then crawl through them to see which of them
			// the new item belongs; keeping in mind, it may have membership is more
			// than one child.
			if (node.hasChildren) {
				for (child = 0; child < 4; child += 1) {
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
		// Call the recursive 'insert' to perform the work of actually
		// adding the new item to the QuadTree.
		insert(root, item);
	};

	return that;
}
