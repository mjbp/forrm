/*
 * Utility functions, smoothing cross-browser inconsistencies
 *
 */
var UTILS = {
	extend: function (){
		for(var i = 1; i < arguments.length; i++) {
			for(var key in arguments[i]) {
				if(arguments[i].hasOwnProperty(key)) {
					arguments[0][key] = arguments[i][key];
				}
			}
		}
		return arguments[0];
	},
	forEach: function (a, fn, scope) {
		var i, l = a.length;
		if ([].forEach) {
			return a.forEach(fn);
		}
		for (i = 0; i < l; i += 1) {
			if (a.hasOwnProperty(i)) {
				fn.call(scope, a[i], i, a);
			}
		}
	},
	on : function (element, events, fn) {
		var evts = events.split(' ');
		for (var i = 0; i < evts.length; i++) {
			if (element.addEventListener) {
				element.addEventListener(evts[i], fn, false);
			} else {
				element.attachEvent('on' + evts[i], fn);
			}
		}
	},
	preventDefault : function (e) {
		if (e.preventDefault) {
			e.preventDefault();
		} else {
			e.returnValue = false;
		}
		return;
	},
	stopImmediatePropagation :function (e) {
		if (e.stopImmediatePropagation) {
			e.stopImmediatePropagation();
		} else {
			e.cancelBubble = true;
		}
		return;
	}
};