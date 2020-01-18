// --------------------------------------------------------------
//
// This system is responsible for handling the movement of any
// entity with a movable component.
//
// --------------------------------------------------------------
Demo.systems.movement = (function () {
    'use strict';

    // --------------------------------------------------------------
    //
    // This handles the logic of moving the front of the entity, along
    // with adding segments as necessary during the move.
    //
    // --------------------------------------------------------------
    function move(entity, xIncrement, yIncrement) {
        let position = entity.components.position;
        //
        // Remember current front position, so it can be added back in as the move
        let front = position.segments[0];

        //
        // Remove the tail, but only if there aren't new segments to add
        if (entity.components.movable.segmentsToAdd === 0 && position.segments.length > 0) {
            position.segments.length = position.segments.length - 1;
        }
        else {
            entity.components.movable.segmentsToAdd--;
        }

        //
        // Update the front of the entity with the segment moving into the new spot
        let newFront = { x: front.x + xIncrement, y: front.y + yIncrement };
        entity.components.position.segments.unshift(newFront);
    }

    // --------------------------------------------------------------
    //
    // If the time interval is up on this entity for moving, move it
    // in the facing direction.
    //
    // --------------------------------------------------------------
    function moveEntity(entity, elapsedTime) {
        entity.components.movable.elapsedInterval = entity.components.movable.elapsedInterval + elapsedTime;
        if (entity.components.movable.elapsedInterval >= entity.components.movable.moveInterval) {
            entity.components.movable.elapsedInterval -= entity.components.movable.moveInterval;
            switch (entity.components.movable.facing) {
                case Demo.enums.Direction.Up:
                    move(entity, 0, -1);
                    break;
                case Demo.enums.Direction.Down:
                    move(entity, 0, 1);
                    break;
                case Demo.enums.Direction.Left:
                    move(entity, -1, 0);
                    break;
                case Demo.enums.Direction.Right:
                    move(entity, 1, 0);
                    break;
            }
        }
    }

    // --------------------------------------------------------------
    //
    // Grind through all the entities and move the ones that can move.
    //
    // --------------------------------------------------------------
    function update(elapsedTime, entities) {
        for (let id in entities) {
            let entity = entities[id];
            if (entity.components.position && entity.components.movable) {
                moveEntity(entity, elapsedTime);
            }
        }
    }

    let api = {
        update: update
    };

    return api;
}());


