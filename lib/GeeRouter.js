(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.GeeRouter = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * Created by geeku on 19/04/2017.
 */

var GeeRouter = function () {
	function GeeRouter() {
		var _this = this;

		var routes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var historyMod = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
		classCallCheck(this, GeeRouter);

		this._hash = '';
		this.from = {
			path: '',
			fullPath: location.href
		};
		this.to = {
			path: '',
			fullPath: location.href
		};

		this.historyMod = 'pushState' in window.history ? historyMod : false;
		this.history = [];
		this.historyAnchor = -1;

		this.beforeEachFuncs = [];
		this.afterEachFuncs = [];

		this.origin = location.protocol + '//' + location.host + location.pathname;

		this.routes = routes;

		this.defaultPath = '/';
		this.page404 = function () {};

		this.path2Ele = {};
		// Current active route
		this.curActive = null;

		this.isControlling = false;

		this.redirectDelay = null;

		// find default route and wildcard route
		this.routes.forEach(function (route) {
			if (route.default) {
				_this.defaultPath = route.path;
			}
			if (route.path === '*') {
				_this.page404 = route.handler;
			}
		});
	}

	createClass(GeeRouter, [{
		key: 'start',
		value: function start() {
			var _this2 = this;

			if (this.historyMod) {
				window.addEventListener('popstate', function (e) {
					var path = e.state && e.state.path;
					if (path) {
						_this2.pathName = path;
					}
				});
			} else {
				window.addEventListener("hashchange", function () {
					_this2.pathName = location.hash.replace('#!', '');
				});
			}
			this._firstPage();
		}
	}, {
		key: 'parse',
		value: function parse(nodelist) {
			var _this3 = this;

			if (typeof nodelist === 'string') {
				nodelist = document.querySelectorAll(nodelist);
			}
			if (!(nodelist instanceof NodeList || nodelist instanceof HTMLCollection || nodelist instanceof Node)) {
				return;
			}

			Array.from(nodelist, function (node) {
				if (node.tagName !== 'A') {
					return;
				}
				var path = node.getAttribute('href');
				var pathWithoutQuery = path.split('?')[0];
				if (_this3.historyMod) {
					node.addEventListener('click', function (e) {
						e.preventDefault();
						_this3._pushState({ path: path }, path, path);
					});
				} else {
					node.setAttribute('href', '#!' + path);
				}

				if (_this3.path2Ele[pathWithoutQuery]) {
					_this3.path2Ele[pathWithoutQuery] = [_this3.path2Ele[pathWithoutQuery]];
					_this3.path2Ele[pathWithoutQuery].push(node);
				} else {
					_this3.path2Ele[pathWithoutQuery] = node;
				}
			});

			return this;
		}
	}, {
		key: '_firstPage',
		value: function _firstPage() {
			if (this.historyMod) {
				// this.defaultPath && this._pushState({ path: this.defaultPath }, null, this.defaultPath);
				return;
			}
			if (location.hash !== '') {
				this.pathName = location.hash.replace('#!', '');
			} else {
				location.hash = '!' + this.defaultPath;
			}
		}
	}, {
		key: '_pushState',
		value: function _pushState() {
			var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
			var url = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

			window.history.pushState(state, title, url);
			this.pathName = url;
		}
	}, {
		key: '_pathChange',
		value: function _pathChange(parame) {
			var _this4 = this;

			if (!this.routes.length) {
				return;
			}
			var from = parame.from;
			var to = parame.to;
			var lastIndex = this.beforeEachFuncs.length - 1;
			var routesLastIndex = this.routes.length - 1;
			var routeState = {
				from: from,
				to: to,
				params: {},
				query: {}
			};

			var toPath = to.fullPath;
			if (toPath.indexOf('?') >= 0) {
				toPath.split('?')[1].split('&').forEach(function (query) {
					var split = query.split('=');
					var key = split[0];
					var value = split[1];
					try {
						routeState.query[key] = window.decodeURIComponent(value);
					} catch (e) {
						routeState.query[key] = value;
					}
				});
			}

			var _loop = function _loop(i) {
				var route = _this4.routes[i];
				var isMatchRoute = false;

				if (_this4.pathName === route.path) {
					isMatchRoute = true;
				} else if (/:\w+/.test(route.path)) {
					var paramsMatches = route.path.match(/:(\w+)/g);
					var pathRegex = route.path.replace(/(:\w+)/g, '([^\/?]+)');
					var pathMatches = new RegExp(pathRegex).exec(_this4.pathName);
					// console.log(paramsMatches, pathRegex, pathMatches);
					if (pathMatches && pathMatches.length) {
						isMatchRoute = true;
						for (var _i = 0; _i < paramsMatches.length; _i++) {
							var param = paramsMatches[_i].replace(':', '');
							try {
								routeState.params[param] = window.decodeURIComponent(pathMatches[_i + 1]);
							} catch (e) {
								routeState.params[param] = pathMatches[_i + 1];
							}
						}
					}
				}

				if (!isMatchRoute) {
					return 'continue';
				}

				// Excute beforeEach functions
				if (_this4.beforeEachFuncs.length) {
					// beforeEach functions chain
					var _index = 0;
					var _next = function _next() {
						// console.log(index);
						if (_index < lastIndex) {
							_this4.beforeEachFuncs[++_index](from, to, _next);
						} else {
							route.handler(routeState);
						}
					};
					_this4.beforeEachFuncs[0](from, to, _next);
				} else {
					route.handler(routeState);
				}

				if (_this4.afterEachFuncs.length) {
					for (var j = 0; j < _this4.afterEachFuncs.length; j++) {
						_this4.afterEachFuncs[j](from, to);
					}
				}

				_this4.redirectDelay && clearTimeout(_this4.redirectDelay);
				if (route.redirect) {
					// Give u a little time to go back
					_this4.redirectDelay = setTimeout(function () {
						_this4._updatePath(route.redirect);
						_this4.redirectDelay = null;
					}, 200);
				}

				return {
					v: void 0
				};
			};

			for (var i = 0; i <= routesLastIndex; i++) {
				var _ret = _loop(i);

				switch (_ret) {
					case 'continue':
						continue;

					default:
						if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
				}
			}

			// 404 page
			if (this.beforeEachFuncs.length) {
				// beforeEach functions chain
				var index = 0;
				var next = function next() {
					// console.log(index);
					if (index < lastIndex) {
						_this4.beforeEachFuncs[++index](from, to, next, '404');
					} else {
						_this4.page404(routeState);
					}
				};
				this.beforeEachFuncs[0](from, to, next, '404');
			} else {
				this.page404(routeState);
			}
		}
	}, {
		key: '_updatePath',
		value: function _updatePath(newPath) {
			if (!this.historyMod) {
				window.location.hash = '!' + newPath;
			} else {
				this._pushState({ path: newPath }, newPath, newPath);
			}
		}
	}, {
		key: 'beforeEach',
		value: function beforeEach(func) {
			this.beforeEachFuncs.push(func);
			return this;
		}
	}, {
		key: 'afterEach',
		value: function afterEach(func) {
			this.afterEachFuncs.push(func);
			return this;
		}
	}, {
		key: 'back',
		value: function back() {
			this.go(-1);
		}
	}, {
		key: 'forward',
		value: function forward() {
			this.go(1);
		}
	}, {
		key: 'go',
		value: function go(count) {

			this.isControlling = true;

			count = ~~count;
			if (count < 0 && this.historyAnchor === 0 || count > 0 && this.historyAnchor === this.history.length - 1) {
				return;
			}

			var historyOffset = this.historyAnchor + count;
			if (count > 0) {
				historyOffset = historyOffset > this.history.length - 1 ? this.history.length - 1 : historyOffset;
			}
			if (count < 0) {
				historyOffset = historyOffset < 0 ? 0 : historyOffset;
			}
			this.historyAnchor = historyOffset;

			var newPath = this.history[historyOffset];
			this._updatePath(newPath);
		}
	}, {
		key: 'push',
		value: function push(newPath) {
			this._updatePath(newPath);
		}
	}, {
		key: 'pathName',
		get: function get$$1() {
			return this._hash;
		},
		set: function set$$1(newVal) {

			this.from.path = this.pathName.split('?')[0];
			this.from.fullPath = this.origin + '#!' + this.pathName;

			this._hash = newVal;

			this.to.path = this.pathName.split('?')[0];
			this.to.fullPath = this.origin + '#!' + this.pathName;

			if (!this.isControlling) {
				this.history.push(this.pathName);
				this.historyAnchor = this.history.length - 1;
			} else {
				this.isControlling = false;
			}

			this._pathChange({ from: this.from, to: this.to });

			if (this.curActive) {
				if (Array.isArray(this.path2Ele[this.curActive])) {
					this.path2Ele[this.curActive].forEach(function (el) {
						el.classList.remove('active');
					});
				} else {
					this.path2Ele[this.curActive].classList.remove('active');
				}
			}
			if (Array.isArray(this.path2Ele[this.to.path])) {
				this.path2Ele[this.to.path].forEach(function (el) {
					el.classList.add('active');
				});
			} else {
				this.path2Ele[this.to.path].classList.add('active');
			}

			this.curActive = this.to.path;
		}
	}]);
	return GeeRouter;
}();

// module.exports = GeeRouter;

return GeeRouter;

})));
