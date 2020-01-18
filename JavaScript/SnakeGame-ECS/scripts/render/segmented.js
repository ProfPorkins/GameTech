// Adding this to the Math object here, because it is used in this part of the
// rendering system
Math.lerp = (a, b, f) => { return a + f * (b - a); };

// --------------------------------------------------------------
//
// This function knows how to render any position component, rendering
// all of the segments it contains.
//
// --------------------------------------------------------------
Demo.render.segmented = function (graphics, appearance, position, gridSize) {
    'use strict';

    let rStart = appearance.fillStart.r;
    let gStart = appearance.fillStart.g;
    let bStart = appearance.fillStart.b;

    let rEnd = appearance.fillEnd.r;
    let gEnd = appearance.fillEnd.g;
    let bEnd = appearance.fillEnd.b;

    for (let segment = 0; segment < position.segments.length; segment++) {
        //
        // Perform a transition from a start to end fill color for each additional segment.
        let fraction = Math.min(segment / 30, 1.0);
        let color = 'rgb(' + Math.lerp(rStart, rEnd, fraction) + ', ' + Math.lerp(gStart, gEnd, fraction) + ', ' + Math.lerp(bStart, bEnd, fraction) + ')';
        graphics.core.drawSquare({
            x: position.segments[segment].x / gridSize,
            y: position.segments[segment].y / gridSize
        },
            1.0 / gridSize,
            color,
            appearance.stroke
        );
    }
};
