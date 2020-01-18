// --------------------------------------------------------------
//
// This is an Entity factory.  An Entity is an 'id' (a number) and
// a collection of components.
//
// --------------------------------------------------------------
Demo.Entity = (function() {
    'use strict';
    let nextId = 1;

    function createEntity() {
        let components = {};

        function addComponent(c) {
            components[c.name] = c;
        }

        function removeComponent(c) {
            delete components[c.name];
        }

        return {
            id: nextId++,
            addComponent: addComponent,
            removeComponent: removeComponent,
            get components() { return components; }
        };
    }

    let api = {
        get nextId() { return nextId; },
        createEntity: createEntity
    };

    return api;
}());
