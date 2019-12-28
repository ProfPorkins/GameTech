// ------------------------------------------------------------------
//
// Rendering function for a /Components/QuadTree object.
//
// ------------------------------------------------------------------
Demo.renderer.QuadTree = (function(core) {
    'use strict';
    let that = {};

    // ------------------------------------------------------------------
    //
    // Overlays a rendering of the QuadTree on top of the world.  This is
    // written as a recursive function that performs a pre-order traversal
    // and rendering.
    //
    // ------------------------------------------------------------------
    function renderQuadTree(node) {
        let child = 0;
        //
        // Recursively (post-order) work through the nodes and draw their bounds on
        // the way down.
        for (child = 0; child < node.children.length; child += 1) {
            renderQuadTree(node.children[child]);
        }

        //
        // Only necessary to render the leaf nodes, this provides a small rendering
        // optimization.
        if (!node.hasChildren) {
            core.drawRectangle(
                'rgba(100, 100, 100, 1)',
                node.left,
                node.top,
                node.size,
                node.size);
            // core.drawCircle(
            //     'rgba(100, 100, 100, 1)',
            //     node.boundingCircle.center,
            //     node.boundingCircle.radius);
        }
    }

    // ------------------------------------------------------------------
    //
    // Public method that allows client code to kick off the rendering
    // of a quad-tree.
    //
    // ------------------------------------------------------------------
    that.render = function(quadTree) {
        renderQuadTree(quadTree.root);
    };

    return that;
}(Demo.renderer.core));
