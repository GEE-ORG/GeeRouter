/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeeRouter = function () {
	function GeeRouter() {
		var _this = this;

		var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

		_classCallCheck(this, GeeRouter);

		this._hash = '';
		this.from = {
			path: '',
			fullPath: location.href
		};
		this.to = {
			path: '',
			fullPath: location.href
		};
		this.history = [];
		this.historyAnchor = -1;

		this.beforeEachFuncs = [];
		this.afterEachFuncs = [];

		this.origin = location.protocol + '//' + location.host + location.pathname;

		this.routes = routes;

		this.defaultPath = '/';
		this.page404 = function () {};

		this.routes.forEach(function (route) {
			if (route.default) {
				_this.defaultPath = route.path;
			}
			if (route.path === '*') {
				_this.page404 = route.handler;
			}
		});
	}

	_createClass(GeeRouter, [{
		key: 'start',
		value: function start() {
			var _this2 = this;

			window.addEventListener("hashchange", function () {
				_this2.hashName = location.hash.replace('#!', '');
				console.log(_this2.hashName);
			});
			this.firstPage();
		}
	}, {
		key: 'firstPage',
		value: function firstPage() {
			if (location.hash !== '') {
				this.hashName = location.hash.replace('#!', '');
			} else {
				location.hash = '!' + this.defaultPath;
			}
		}
	}, {
		key: 'hashChange',
		value: function hashChange(parame) {
			var _this3 = this;

			if (this.routes.length) {
				var _ret = function () {

					var from = parame.from;
					var to = parame.to;
					var lastIndex = _this3.beforeEachFuncs.length - 1;
					var routesLastIndex = _this3.routes.length - 1;

					var _loop = function _loop(i) {
						var route = _this3.routes[i];

						if (_this3.hashName === route.path) {
							if (_this3.beforeEachFuncs.length) {
								var _index = 0;
								var _next = function _next() {
									if (_index < lastIndex) {
										_this3.beforeEachFuncs[++_index](from, to, _next);
									} else {
										route.handler({ from: from, to: to });
									}
								};
								_this3.beforeEachFuncs[0](from, to, _next);
							} else {
								route.handler({ from: from, to: to });
							}

							if (_this3.afterEachFuncs.length) {
								for (var j = 0; j < _this3.afterEachFuncs.length; j++) {
									_this3.afterEachFuncs[j]();
								}
							}

							return {
								v: {
									v: void 0
								}
							};
						}
					};

					for (var i = 0; i < routesLastIndex; i++) {
						var _ret2 = _loop(i);

						if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
					}

					if (_this3.beforeEachFuncs.length) {
						var index = 0;
						var next = function next() {
							if (index < lastIndex) {
								_this3.beforeEachFuncs[++index](from, to, next, '404');
							} else {
								_this3.page404({ from: from, to: to });
							}
						};
						_this3.beforeEachFuncs[0](from, to, next, '404');
					} else {
						_this3.page404({ from: from, to: to });
					}
				}();

				if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
			}
		}
	}, {
		key: 'beforeEach',
		value: function beforeEach(func) {
			this.beforeEachFuncs.push(func);
			func(this.from, this.to, function () {});

			return this;
		}
	}, {
		key: 'afterEach',
		value: function afterEach(func) {
			this.afterEachFuncs.push(func);
			func(this.from, this.to);

			return this;
		}
	}, {
		key: 'back',
		value: function back() {
			if (this.history.length < 2) {
				return;
			}
			this.hashName = this.history[this.historyAnchor - 1];
		}
	}, {
		key: 'go',
		value: function go(cout) {
			if (cout > 0 && this.history.length - 1 - this.historyAnchor >= cout) {
				this.hashName = this.history[this.historyAnchor - cout];
			}

			if (cout < 0 && this.historyAnchor >= Math.abs(cout)) {
				this.hashName = this.history[this.historyAnchor + cout];
			}
		}
	}, {
		key: 'hashName',
		get: function get() {
			return this._hash;
		},
		set: function set(newVal) {

			this.from.path = this.hashName;
			this.from.fullPath = this.origin + '#!' + this.hashName;

			this._hash = newVal;

			this.to.path = this.hashName;
			this.to.fullPath = this.origin + '#!' + this.hashName;

			this.history.push(this.hashName);
			this.historyAnchor += 1;

			this.hashChange({ from: this.from, to: this.to });
		}
	}]);

	return GeeRouter;
}();

exports.default = GeeRouter;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _GeeRouter = __webpack_require__(0);

var _GeeRouter2 = _interopRequireDefault(_GeeRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

new _GeeRouter2.default([]);

var a = function a() {
	_classCallCheck(this, a);

	console.log(1);
};

/***/ })
/******/ ]);