// --------------------------------------------------------------
//
// This system knows how to accept keyboard input and use that
// to move an entity, based on the entities 'keyboard-controlled'
// component settings.
//
// --------------------------------------------------------------
Demo.systems.keyboardInput = (function (components) {
    'use strict';
    let keysDown = {};

    function keyPress(e) {
        keysDown[e.key] = e.timeStamp;
    }
    
    function keyRelease(e) {
        delete keysDown[e.key];
    }

    // --------------------------------------------------------------
    //
    // Public interface used to update entities based on keyboard input.
    //
    // --------------------------------------------------------------
    function update(elapsedTime, entities) {
        for (let id in entities) {
            let entity = entities[id];
            if (entity.components[Demo.enums.Input.KeyboardControlled]) {
                let input = entity.components[Demo.enums.Input.KeyboardControlled];
                for (let key in input.keys) {
                    if (keysDown[key]) {
                        // Protect against turning back onto itself
                        let canTurn = true;
                        if ((entity.components.movable.facing === Demo.enums.Direction.Up) && keysDown['ArrowDown']) {
                            canTurn = false;
                        }
                        if ((entity.components.movable.facing === Demo.enums.Direction.Down) && keysDown['ArrowUp']) {
                            canTurn = false;
                        }
                        if ((entity.components.movable.facing === Demo.enums.Direction.Left) && keysDown['ArrowRight']) {
                            canTurn = false;
                        }
                        if ((entity.components.movable.facing === Demo.enums.Direction.Right) && keysDown['ArrowLeft']) {
                            canTurn = false;
                        }

                        if (canTurn) {
                            entity.components.movable.facing = input.keys[key];
                        }
                    }
                }
            }
        }
    }

    window.addEventListener('keydown', keyPress);
    window.addEventListener('keyup', keyRelease);

    let api = {
        update: update
    };

    return api;
}(Demo.components));
