/* globals Demo, console, require */

Demo = {
	input: {},
	components: {},
	renderer: {}
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
	var scriptOrder = [
		{
			scripts: ['Input/Keyboard'],
			message: 'Inputs loaded',
			onComplete: null
		},
		{
			scripts: ['Components/Text'],
			message: 'Components loaded',
			onComplete: null
		},
		{
			scripts: ['Rendering/core'],
			message: 'Rendering core loaded',
			onComplete: null
		},
		{
			scripts: ['Rendering/Text'],
			message: 'Rendering loaded',
			onComplete: null
		},
		{
			scripts: ['model'],
			message: 'Model loaded',
			onComplete: null
		},
		{
			scripts: ['main'],
			message: 'Main loaded',
			onComplete: null
		}
	];

	//------------------------------------------------------------------
	//
	// Helper function used to load scripts in the order specified by the
	// 'scripts' parameter.  'scripts' expects an array of objects with
	// the following format...
	//	{
	//		scripts: [script1, script2, ...],
	//		message: 'Console message displayed after loading is complete',
	//		onComplete: function to call when loading is complete, may be null
	//	}
	//
	//------------------------------------------------------------------
	function loadScripts(scripts, onComplete) {
		var entry = 0;
		//
		// When we run out of things to load, that is when we call onComplete.
		if (scripts.length > 0) {
			entry = scripts[0];
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
	// Called when all the scripts are loaded, it kicks off the demo app.
	//
	//------------------------------------------------------------------
	function mainComplete() {
		console.log('it is all loaded up');
		Demo.main.initialize();
	}

	//
	// Start with the input scripts, the cascade from there
	console.log('Starting to dynamically load project scripts');
	loadScripts(scriptOrder, mainComplete);
}());
