// --------------------------------------------------------------
//
// This system is responsible for renderign the whole game, which
// is just the background and the entities with a appearance
// and position components.
//
// --------------------------------------------------------------
Demo.systems.render = (function (graphics) {
    'use strict';

    // --------------------------------------------------------------
    //
    // Find all the entities with both appearance and position components
    // and render them as segmented.
    //
    // --------------------------------------------------------------
    function renderEntities(entities, gridSize) {
        for (let id in entities) {
            let entity = entities[id];
            if (entity.components.appearance && entity.components.position) {
                Demo.render.segmented(graphics, entity.components.appearance, entity.components.position, gridSize);
            }
        }
    }

    // --------------------------------------------------------------
    //
    // Public interface used to get the whole game rendered.
    //
    // --------------------------------------------------------------
    function update(elapsedTime, entities, gridSize) {
        Demo.render.background(graphics);
        renderEntities(entities, gridSize);
    }

    let api = {
        update: update
    };

    return api;
}(Demo.graphics));
