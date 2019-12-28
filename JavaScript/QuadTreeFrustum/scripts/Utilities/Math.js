// ------------------------------------------------------------------
//
// Input handling support
//
// ------------------------------------------------------------------
Demo.utilities.math = (function() {
    'use strict';
    let that = {};

    //------------------------------------------------------------------
    //
    // This method checks to see if any part of the circle is inside of
    // the square.  If it is, true is returned, false otherwise.
    //
    // This code adapted from: http://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
    //
    //------------------------------------------------------------------
    that.circleTouchSquare = function(circle, square) {
        let squareSizeby2 = square.size / 2;
        let circleDistanceX;
        let circleDistanceY;
        let distanceX;
        let distanceY;
        let cornerDistanceSq;

        circleDistanceX = Math.abs(circle.center.x - square.center.x);
        if (circleDistanceX > (squareSizeby2 + circle.radius)) { return false; }
        circleDistanceY = Math.abs(circle.center.y - square.center.y);
        if (circleDistanceY > (squareSizeby2 + circle.radius)) { return false; }

        if (circleDistanceX <= squareSizeby2) { return true; }
        if (circleDistanceY <= squareSizeby2) { return true; }

        distanceX = (circleDistanceX - squareSizeby2);
        distanceY = (circleDistanceY - squareSizeby2);
        distanceX *= distanceX;
        distanceY *= distanceY;

        cornerDistanceSq = distanceX + distanceY;

        return (cornerDistanceSq <= circle.radiusSq);
    };

    // ------------------------------------------------------------------
    //
    // Determines if a point is inside of a triangle or not.
    // Reference: http://www.blackpawn.com/texts/pointinpoly/
    //
    // ------------------------------------------------------------------
    function pointInTriangle(pt, triangle) {
        let v0x = triangle.pt3.x - triangle.pt1.x;
        let v0y = triangle.pt3.y - triangle.pt1.y;
        let v1x = triangle.pt2.x - triangle.pt1.x;
        let v1y = triangle.pt2.y - triangle.pt1.y;
        let v2x = pt.x - triangle.pt1.x;
        let v2y = pt.y - triangle.pt1.y;
        let dot00 = v0x * v0x + v0y * v0y;
        let dot01 = v0x * v1x + v0y * v1y;
        let dot02 = v0x * v2x + v0y * v2y;
        let dot11 = v1x * v1x + v1y * v1y;
        let dot12 = v1x * v2x + v1y * v2y;
        let b = (dot00 * dot11 - dot01 * dot01);
        let inv = b === 0 ? 0 : (1 / b);
        let u = (dot11 * dot02 - dot01 * dot12) * inv;
        let v = (dot00 * dot12 - dot01 * dot02) * inv;

        return u >= 0 && v >= 0 && (u+v < 1);
    }

    // ------------------------------------------------------------------
    //
    // Determines if a point is inside of a triangle or not.
    // Reference: http://stackoverflow.com/questions/2049582/how-to-determine-a-point-in-a-2d-triangle
    // Reference: http://www.gamedev.net/topic/295943-is-this-a-better-point-in-triangle-test-2d/
    // Another good reference: http://totologic.blogspot.fr/2014/01/accurate-point-in-triangle-test.html
    //
    // ------------------------------------------------------------------
    function sign(pt1, pt2, pt3) {
        return (pt1.x - pt3.x) * (pt2.y - pt3.y) - (pt2.x - pt3.x) * (pt1.y - pt3.y);
    }
    function pointInTriangle2(pt, triangle) {
        let b1 = sign(pt, triangle.pt1, triangle.pt2) < 0;
        let b2 = sign(pt, triangle.pt2, triangle.pt3) < 0;
        let b3 = sign(pt, triangle.pt3, triangle.pt1) < 0;

        return ((b1 === b2) && (b2 === b3));
    }

    // ------------------------------------------------------------------
    //
    // Determines if a point is inside of a circle.
    //
    // ------------------------------------------------------------------
    function pointInCircle(pt, circle) {
        let distance = Math.pow(pt.x - circle.center.x, 2) + Math.pow(pt.y - circle.center.y, 2);

        return distance < circle.radiusSq;
    }

    // ------------------------------------------------------------------
    //
    // Determines if a circle intersects with a line segment.
    // Reference: http://stackoverflow.com/questions/6091728/line-segment-circle-intersection
    // Reference: http://mathworld.wolfram.com/Circle-LineIntersection.html
    //
    // ------------------------------------------------------------------
    function circleTouchLine(circle, pt1, pt2) {
        let dx = pt2.x - pt1.x;
        let dy = pt2.y - pt1.y;
        let a = dx * dx + dy * dy;
        let b = 2 * (dx * (pt1.x - circle.center.x) + dy * (pt1.y - circle.center.y));
        let c = circle.center.x * circle.center.x + circle.center.y * circle.center.y;

        c += (pt1.x * pt1.x + pt1.y * pt1.y);
        c -= (2 * (circle.center.x * pt1.x + circle.center.y * pt1.y));
        c -= (circle.radius * circle.radius);
        let bb4ac = b * b - 4 * a * c;

        return bb4ac >= 0;
    }

    // ------------------------------------------------------------------
    //
    // Determines if a circle and triangle intersect at any point.
    // TODO: Could improve performance by first testing for the point
    //          inside the triangle bounding box first, then test for point
    //         inside the triangle.
    //
    // ------------------------------------------------------------------
    that.circleTouchTriangle = function(circle, triangle) {
        if (pointInTriangle2(circle.center, triangle)) {
            return true;
        }
        if (circleTouchLine(circle, triangle.pt1, triangle.pt2)) {
            return true;
        }
        if (circleTouchLine(circle, triangle.pt2, triangle.pt3)) {
            return true;
        }
        if (circleTouchLine(circle, triangle.pt3, triangle.pt1)) {
            return true;
        }

        return false;
    };

    // ------------------------------------------------------------------
    //
    // Computes the circle that goes through the three points of a triangle.
    // Reference used: http://formulas.tutorvista.com/math/circumcenter-formula.html#
    // Other references I also looked at (not claiming how useful they were, but I considered them):
    //        https://en.wikipedia.org/wiki/Circumscribed_circle
    //        http://www.ics.uci.edu/~eppstein/junkyard/circumcenter.html
    //        http://cppgm.blogspot.com/2008/03/circle-through-three-points.html
    //        http://stackoverflow.com/questions/13977354/build-circle-from-3-points-in-3d-space-implementation-in-c-or-c
    //
    // ------------------------------------------------------------------
    that.circleFromTriangle = function(ptA, ptB, ptC) {
        let circleSpec = {
                center: {},
                radius: 0
            };
        let midPointAB = {
                x: (ptA.x + ptB.x) / 2,
                y: (ptA.y + ptB.y) / 2
            };
        let midPointAC = {
                x: (ptA.x + ptC.x) / 2,
                y: (ptA.y + ptC.y) / 2
            };
        let slopeAB = (ptB.y - ptA.y) / (ptB.x - ptA.x);
        let slopeAC = (ptC.y - ptA.y) / (ptC.x - ptA.x);
        slopeAB = -(1 / slopeAB);
        slopeAC = -(1 / slopeAC);

        circleSpec.center.x = (midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x) / (slopeAB - slopeAC);
        circleSpec.center.y = slopeAC * (circleSpec.center.x - midPointAC.x) + midPointAC.y;
        //
        // Radius is distance from the center to any of the points
        circleSpec.radius = Math.sqrt(Math.pow(circleSpec.center.x - ptA.x, 2) + Math.pow(circleSpec.center.y - ptA.y, 2));

        return Demo.components.Circle(circleSpec);

        //
        // Yes, I actually derived these equations all by my lonesome!
        //

        // y - midPointAB.y = slopeAB * (x -  midPointAB.x)
        // y = midPointAB.y + slopeAB * (x - midPointAB.x)
        // y - midPointAB.y = slopeAB * x - slopeAB * midPointAB.x
        // slopeAB * x = y - midPointAB.y + slopeAB * midPointAB.x
        // x = (y - midPointAB.y + slopeAB * midPointAB.x) / slopeAB

        // y - midPointAC.y = slopeAC(x - midPointAC.x)
        // y = slopeAC * (x - midPointAC.x) + midPointAC.y

        //
        // Solve for x
        // midPointAB.y + slopeAB * (x - midPointAB.x) = midPointAC.y + slopeAC * (x - midPointAC.x)
        // midPointAB.y + slopeAB * x - slopeAB * midPointAB.x = midPointAC.y + slopeAC * x - slopeAC * midPointAC.x
        // slopeAB * x - slopeAC * x = midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x
        // x * (slopeAB - slopeAC) = midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x
        // x = (midPointAC.y - midPointAB.y + slopeAB * midPointAB.x - slopeAC * midPointAC.x) / (slopeAB - slopeAC)
    };

    return that;
}());
