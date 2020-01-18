// --------------------------------------------------------------
//
// This system handles collision detection for movable components
// against anything else in the game.  It also exposes a collision
// detection function that allows the game model to test if a
// proposed entity collides with any other (collidable) entity.
//
// --------------------------------------------------------------
Demo.systems.collision = (function () {
    'use strict';

    // --------------------------------------------------------------
    //
    // Returns a collection of all the movable entities.
    //
    // --------------------------------------------------------------
    function findMovable(entities) {
        let movable = [];
        for (let id in entities) {
            let entity = entities[id];
            if (entity.components.movable && entity.components.position) {
                movable.push(entity);
            }
        }

        return movable;
    }

    // --------------------------------------------------------------
    //
    // We know that only the snake is moving and that we only need
    // to check its head for collision with other entities.  Therefore,
    // don't need to look at all the segments in the position, with the
    // exception of the movable itself...a movable can collide with itself.
    //
    // --------------------------------------------------------------
    function collides(a, b) {
        //
        // A movable can collide with itself: Check segment against the rest
        if (a === b) {
            let position = a.components.position;
            // Starting from one, because we don't test the head of a movable with itself
            for (let segment = 1; segment < position.segments.length; segment++) {
                if (position.x === position.segments[segment].x && position.y === position.segments[segment].y) {
                    return true;
                }
            }
            return false;
        }

        // If only the first segment needs to be tested, only test that segment
        let lengthA = a.components.collision.firstOnly ? 1 : a.components.position.segments.length;
        let lengthB = b.components.collision.firstOnly ? 1 : b.components.position.segments.length;

        // Double for loop looks bad, but it isn't because only 1 of these will ever have a length
        // greater than 1, and most of the time both are of length 1.
        for (let segmentA = 0; segmentA < lengthA; segmentA++) {
            let positionA = a.components.position.segments[segmentA];
            for (let segmentB = 0; segmentB < lengthB; segmentB++) {
                let positionB = b.components.position.segments[segmentB];
                if (positionA.x == positionB.x && positionA.y == positionB.y) {
                    return true;
                }
            }
        }

        return false;
    }

    // --------------------------------------------------------------
    //
    // Public interface that allows an entity with a single cell position
    // to be tested for collision with anything else in the game.
    //
    // --------------------------------------------------------------
    function collidesWithAny(proposed, entities) {
        let aPosition = proposed.components.position;

        for (let id in entities) {
            let entity = entities[id];
            if (entity.components.collision && entity.components.position) {
                let ePosition = entity.components.position;

                for (let segment = 0; segment < ePosition.segments.length; segment++) {
                    if (aPosition.x === ePosition.segments[segment].x && aPosition.y === ePosition.segments[segment].y) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // --------------------------------------------------------------
    //
    // Check to see if any movable components collide with any other
    // collision components.
    //
    // Step 1: find all movable components first
    // Step 2: Test the movable components for collision with other (but not self) collision components
    //
    // --------------------------------------------------------------
    function update(elapsedTime, entities, reportEvent) {
        let movable = findMovable(entities);

        for (let id in entities) {
            let entity = entities[id];
            if (entity.components.collision && entity.components.position) {
                for (let m = 0; m < movable.length; m++) {
                    let entityMovable = movable[m];
                    if (collides(entity, entityMovable)) {
                        //
                        // If food, that's okay
                        if (entity.components.food) {
                            entityMovable.components.movable.segmentsToAdd = 3;
                            reportEvent({
                                type: Demo.enums.Event.ConsumeFood,
                                entity: entity
                            });
                        } else {    // If anything else, not okay
                            entityMovable.components.movable.facing = Demo.enums.Direction.Stopped;
                            reportEvent({
                                type: Demo.enums.Event.HitSomething,
                                entity: entity
                            });
                        }
                    }
                }
            }
        }
    }

    let api = {
        update: update,
        collidesWithAny: collidesWithAny
    };

    return api;
}());
