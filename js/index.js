/*jslint devel:true */
/*global ace, brython */

(function (umgl) {
	"use strict";

	window.onload = function () {
		umgl.init();
	};

	window.onunload = function () {
		umgl.dispose();
	};

}(window.umgl));
