/* global Demo */

// ------------------------------------------------------------------
//
// Keyboard input handling support
//
// ------------------------------------------------------------------
Demo.input.Keyboard = function() {
	'use strict';
	var keys = {},
		keyRepeat = {},
		handlers = [],
		that = {};

	function keyDown(event) {
		keys[event.keyCode] = event.timeStamp;
		//
		// Because we can continuously receive the keyDown event, check to
		// see if we already have this property.  If we do, we don't want to
		// overwrite the value that already exists.
		if (keyRepeat.hasOwnProperty(event.keyCode) === false) {
			keyRepeat[event.keyCode] = false;
		}
	}

	function keyRelease(event) {
		delete keys[event.keyCode];
		delete keyRepeat[event.keyCode];
	}

	// ------------------------------------------------------------------
	//
	// Allows the client code to register a keyboard handler
	//
	// ------------------------------------------------------------------
	that.registerCommand = function(key, repeat, handler) {
		handlers.push({
			key: key,
			repeat: repeat,
			handler: handler
		});
	};

	// ------------------------------------------------------------------
	//
	// Allows the client to invoke all the handlers for the registered key/handlers.
	// I've modified this function for the quad-tree demo to only fire the
	// first time the 'keydown' event occurs.  It the key gets reset after
	// the 'keyup' event happens.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var key = 0;

		for (key = 0; key < handlers.length; key += 1) {
			if (keys.hasOwnProperty(handlers[key].key)) {
				if (handlers[key].repeat === true ||
					(handlers[key].repeat === false && keyRepeat[handlers[key].key] === false)) {
					handlers[key].handler(elapsedTime);
					keyRepeat[handlers[key].key] = true;
				}
			}
		}
	};

	//
	// These are used to keep track of which keys are currently pressed
	window.addEventListener('keydown', keyDown);
	window.addEventListener('keyup', keyRelease);

	return that;
};

//------------------------------------------------------------------
//
// Source: http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
//
//------------------------------------------------------------------
Demo.input.KeyEvent = (function() {
	'use strict';
	var that = {
		get DOM_VK_CANCEL() { return 3; },
		get DOM_VK_HELP() { return 6; },
		get DOM_VK_BACK_SPACE() { return 8; },
		get DOM_VK_TAB() { return 9; },
		get DOM_VK_CLEAR() { return 12; },
		get DOM_VK_RETURN() { return 13; },
		get DOM_VK_ENTER() { return 14; },
		get DOM_VK_SHIFT() { return 16; },
		get DOM_VK_CONTROL() { return 17; },
		get DOM_VK_ALT() { return 18; },
		get DOM_VK_PAUSE() { return 19; },
		get DOM_VK_CAPS_LOCK() { return 20; },
		get DOM_VK_ESCAPE() { return 27; },
		get DOM_VK_SPACE() { return 32; },
		get DOM_VK_PAGE_UP() { return 33; },
		get DOM_VK_PAGE_DOWN() { return 34; },
		get DOM_VK_END() { return 35; },
		get DOM_VK_HOME() { return 36; },
		get DOM_VK_LEFT() { return 37; },
		get DOM_VK_UP() { return 38; },
		get DOM_VK_RIGHT() { return 39; },
		get DOM_VK_DOWN() { return 40; },
		get DOM_VK_PRINTSCREEN() { return 44; },
		get DOM_VK_INSERT() { return 45; },
		get DOM_VK_DELETE() { return 46; },
		get DOM_VK_0() { return 48; },
		get DOM_VK_1() { return 49; },
		get DOM_VK_2() { return 50; },
		get DOM_VK_3() { return 51; },
		get DOM_VK_4() { return 52; },
		get DOM_VK_5() { return 53; },
		get DOM_VK_6() { return 54; },
		get DOM_VK_7() { return 55; },
		get DOM_VK_8() { return 56; },
		get DOM_VK_9() { return 57; },
		get DOM_VK_SEMICOLON() { return 59; },
		get DOM_VK_EQUALS() { return 61; },
		get DOM_VK_A() { return 65; },
		get DOM_VK_B() { return 66; },
		get DOM_VK_C() { return 67; },
		get DOM_VK_D() { return 68; },
		get DOM_VK_E() { return 69; },
		get DOM_VK_F() { return 70; },
		get DOM_VK_G() { return 71; },
		get DOM_VK_H() { return 72; },
		get DOM_VK_I() { return 73; },
		get DOM_VK_J() { return 74; },
		get DOM_VK_K() { return 75; },
		get DOM_VK_L() { return 76; },
		get DOM_VK_M() { return 77; },
		get DOM_VK_N() { return 78; },
		get DOM_VK_O() { return 79; },
		get DOM_VK_P() { return 80; },
		get DOM_VK_Q() { return 81; },
		get DOM_VK_R() { return 82; },
		get DOM_VK_S() { return 83; },
		get DOM_VK_T() { return 84; },
		get DOM_VK_U() { return 85; },
		get DOM_VK_V() { return 86; },
		get DOM_VK_W() { return 87; },
		get DOM_VK_X() { return 88; },
		get DOM_VK_Y() { return 89; },
		get DOM_VK_Z() { return 90; },
		get DOM_VK_CONTEXT_MENU() { return 93; },
		get DOM_VK_NUMPAD0() { return 96; },
		get DOM_VK_NUMPAD1() { return 97; },
		get DOM_VK_NUMPAD2() { return 98; },
		get DOM_VK_NUMPAD3() { return 99; },
		get DOM_VK_NUMPAD4() { return 100; },
		get DOM_VK_NUMPAD5() { return 101; },
		get DOM_VK_NUMPAD6() { return 102; },
		get DOM_VK_NUMPAD7() { return 103; },
		get DOM_VK_NUMPAD8() { return 104; },
		get DOM_VK_NUMPAD9() { return 105; },
		get DOM_VK_MULTIPLY() { return 106; },
		get DOM_VK_ADD() { return 107; },
		get DOM_VK_SEPARATOR() { return 108; },
		get DOM_VK_SUBTRACT() { return 109; },
		get DOM_VK_DECIMAL() { return 110; },
		get DOM_VK_DIVIDE() { return 111; },
		get DOM_VK_F1() { return 112; },
		get DOM_VK_F2() { return 113; },
		get DOM_VK_F3() { return 114; },
		get DOM_VK_F4() { return 115; },
		get DOM_VK_F5() { return 116; },
		get DOM_VK_F6() { return 117; },
		get DOM_VK_F7() { return 118; },
		get DOM_VK_F8() { return 119; },
		get DOM_VK_F9() { return 120; },
		get DOM_VK_F10() { return 121; },
		get DOM_VK_F11() { return 122; },
		get DOM_VK_F12() { return 123; },
		get DOM_VK_F13() { return 124; },
		get DOM_VK_F14() { return 125; },
		get DOM_VK_F15() { return 126; },
		get DOM_VK_F16() { return 127; },
		get DOM_VK_F17() { return 128; },
		get DOM_VK_F18() { return 129; },
		get DOM_VK_F19() { return 130; },
		get DOM_VK_F20() { return 131; },
		get DOM_VK_F21() { return 132; },
		get DOM_VK_F22() { return 133; },
		get DOM_VK_F23() { return 134; },
		get DOM_VK_F24() { return 135; },
		get DOM_VK_NUM_LOCK() { return 144; },
		get DOM_VK_SCROLL_LOCK() { return 145; },
		get DOM_VK_COMMA() { return 188; },
		get DOM_VK_PERIOD() { return 190; },
		get DOM_VK_SLASH() { return 191; },
		get DOM_VK_BACK_QUOTE() { return 192; },
		get DOM_VK_OPEN_BRACKET() { return 219; },
		get DOM_VK_BACK_SLASH() { return 220; },
		get DOM_VK_CLOSE_BRACKET() { return 221; },
		get DOM_VK_QUOTE() { return 222; },
		get DOM_VK_META() { return 224; }
	};

	return that;
}());