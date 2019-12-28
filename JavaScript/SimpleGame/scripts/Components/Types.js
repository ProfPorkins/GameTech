// ------------------------------------------------------------------
//
// This namespace holds the type enumerations for the different components
// used by the gameplay code.
//
// ------------------------------------------------------------------
Demo.components.Types = (function() {
    'use strict';
    let that = {
        get Undefined() { return 0; },
        get SpaceShip() { return 1; },
        get Missile() { return 2; },
        get Base() { return 3; }
    };

    return that;
}());
