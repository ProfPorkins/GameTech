//------------------------------------------------------------------
//
// Defines an Explosion component.  An explosion is defined as
//  {
//      id:                     // Game model unique id of the explosion
//      center: { x: , y: }     // In world coordinates
//  }
//
//------------------------------------------------------------------
Demo.components.Explosion = function(spec) {
    'use strict';
    let that = {};

    let spriteSpec = {
        id: spec.id,
        spriteSheet: Demo.assets['explosion'],
        spriteSize: { width: 0.07, height: 0.07 },
        spriteCenter: spec.center,
        spriteCount: 16,
        spriteTime: [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    };
    let sprite = Demo.components.AnimatedSprite(spriteSpec);

    // Set how long this explosion should last.
    spec.lifetime = 0;
    spriteSpec.spriteTime.forEach(item => {
        spec.lifetime += item;
    });

    Object.defineProperty(that, 'id', {
        get: () => spec.id
    });

    Object.defineProperty(that, 'sprite', {
        get: () => sprite
    });

    //------------------------------------------------------------------
    //
    // The only update to do is to tell the underlying animated sprite
    // to update.
    //
    //------------------------------------------------------------------
    that.update = function(elapsedTime) {
        this.sprite.update(elapsedTime, true);
        spec.lifetime -= elapsedTime;

        // When this becomes false, the explosion should be removed.
        return spec.lifetime > 0;
    };

    return that;
};
