let Demo = {
    input: {},
    components: {},
    utilities: {},
    renderer: {},
    assets: {}
};

//------------------------------------------------------------------
//
// Purpose of this code is to bootstrap (maybe I should use that as the name)
// the rest of the application.  Only this file is specified in the index.html
// file, then the code in this file gets all the other code and assets
// loaded.
//
//------------------------------------------------------------------
Demo.loader = (function() {
    'use strict';
    let scriptOrder = [
        {
            scripts: ['../shared/network-ids'],
            message: 'Network Ids loaded',
            onComplete: null,
        }, {
            scripts: ['../shared/queue'],
            message: 'Utilities loaded',
            onComplete: null,
        }, {
            scripts: ['Utilities/Math', 'Utilities/Random'],
            message: 'Utilities loaded',
            onComplete: null
        }, {
            scripts: ['Input/Keyboard'],
            message: 'Inputs loaded',
            onComplete: null
        }, {
            scripts: ['Components/Text', 'Components/Sprite', 'Components/AnimatedSprite'],
            message: 'Core Components loaded',
            onComplete: null
        }, {
            scripts: ['Components/SpaceShip', 'Components/SpaceShipRemote', 'Components/Missile', 'Components/Explosion'],
            message: 'SpaceShip Components loaded',
            onComplete: null
        }, {
            scripts: ['Rendering/core'],
            message: 'Rendering core loaded',
            onComplete: null
        }, {
            scripts: ['Rendering/Text', 'Rendering/Sprite', 'Rendering/AnimatedSprite'],
            message: 'Rendering plugins loaded',
            onComplete: null
        }, {
            scripts: ['Rendering/SpaceShip', 'Rendering/Missile', 'Rendering/Explosion'],
            message: 'More Rendering plugins loaded',
            onComplete: null
        }, {
            scripts: ['model'],
            message: 'Model loaded',
            onComplete: null
        }, {
            scripts: ['main'],
            message: 'Main loaded',
            onComplete: null
        }];
    let assetOrder = [{
            key: 'spaceship-red',
            source: 'assets/playerShip1_red.png'
        }, {
            key: 'spaceship-blue',
            source: 'assets/playerShip1_blue.png'
        }, {
            key: 'explosion',
            source: 'assets/explosion.png'
        }];

    //------------------------------------------------------------------
    //
    // Helper function used to load scripts in the order specified by the
    // 'scripts' parameter.  'scripts' expects an array of objects with
    // the following format...
    //    {
    //        scripts: [script1, script2, ...],
    //        message: 'Console message displayed after loading is complete',
    //        onComplete: function to call when loading is complete, may be null
    //    }
    //
    //------------------------------------------------------------------
    function loadScripts(scripts, onComplete) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (scripts.length > 0) {
            let entry = scripts[0];
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                scripts.splice(0, 1);
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'asset/url/asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    function loadAssets(assets, onSuccess, onError, onComplete) {
        let entry = 0;
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            entry = assets[0];
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    assets.splice(0, 1);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    //------------------------------------------------------------------
    //
    // This function is used to asynchronously load image and audio assets.
    // On success the asset is provided through the onSuccess callback.
    // Reference: http://www.html5rocks.com/en/tutorials/file/xhr2/
    //
    //------------------------------------------------------------------
    function loadAsset(source, onSuccess, onError) {
        let xhr = new XMLHttpRequest();
        let asset = null;
        let fileExtension = source.substr(source.lastIndexOf('.') + 1);    // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                        if (onSuccess) { onSuccess(asset); }
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }

    //------------------------------------------------------------------
    //
    // Called when all the scripts are loaded, it kicks off the demo app.
    //
    //------------------------------------------------------------------
    function mainComplete() {
        console.log('it is all loaded up');
        Demo.main.initialize();
    }

    //
    // Start with loading the assets, then the scripts.
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {    // Store it on success
            Demo.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
