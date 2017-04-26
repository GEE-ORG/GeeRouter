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
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/**
 * Created by geeku on 19/04/2017.
 */

class GeeRouter {
	constructor(routes = [], historyMod = false) {
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
		this.page404 = () => {};

		this.path2Ele = {};
		// Current active route
		this.curActive = null;

		this.isControlling = false;

		this.redirectDelay = null;

		// find default route and wildcard route
		this.routes.forEach(route => {
			if (route.default) {
				this.defaultPath = route.path;
			}
			if (route.path === '*') {
				this.page404 = route.handler;
			}
		});
	}

	start() {
		if (this.historyMod) {
			window.addEventListener('popstate', e => {
				const path = e.state && e.state.path;
				if (path) {
					this.pathName = path;
				}
			});
		} else {
			window.addEventListener("hashchange", () => {
				this.pathName = location.hash.replace('#!', '');
			});
		}
		this._firstPage();
	}

	parse(nodelist) {
		if (typeof nodelist === 'string') {
			nodelist = document.querySelectorAll(nodelist);
		}
		if (!(nodelist instanceof NodeList || nodelist instanceof HTMLCollection || nodelist instanceof Node)) {
			return;
		}

		Array.from(nodelist, node => {
			if (node.tagName !== 'A') {
				return;
			}
			const path = node.getAttribute('href');
			const pathWithoutQuery = path.split('?')[0];
			if (this.historyMod) {
				node.addEventListener('click', e => {
					e.preventDefault();
					this._pushState({ path: path }, path, path);
				});
			} else {
				node.setAttribute('href', '#!' + path);
			}

			if (this.path2Ele[pathWithoutQuery]) {
				this.path2Ele[pathWithoutQuery] = [this.path2Ele[pathWithoutQuery]];
				this.path2Ele[pathWithoutQuery].push(node);
			} else {
				this.path2Ele[pathWithoutQuery] = node;
			}
		});

		return this;
	}

	_firstPage() {
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

	_pushState(state = {}, title = null, url = '') {
		window.history.pushState(state, title, url);
		this.pathName = url;
	}

	get pathName() {
		return this._hash;
	}

	set pathName(newVal) {

		this.from.path = this.pathName.split('?')[0];
		this.from.fullPath = `${this.origin}#!${this.pathName}`;

		this._hash = newVal;

		this.to.path = this.pathName.split('?')[0];
		this.to.fullPath = `${this.origin}#!${this.pathName}`;

		if (!this.isControlling) {
			this.history.push(this.pathName);
			this.historyAnchor = this.history.length - 1;
		} else {
			this.isControlling = false;
		}

		this._pathChange({ from: this.from, to: this.to });

		if (this.curActive) {
			if (Array.isArray(this.path2Ele[this.curActive])) {
				this.path2Ele[this.curActive].forEach(el => {
					el.classList.remove('active');
				});
			} else {
				this.path2Ele[this.curActive].classList.remove('active');
			}
		}
		if (Array.isArray(this.path2Ele[this.to.path])) {
			this.path2Ele[this.to.path].forEach(el => {
				el.classList.add('active');
			});
		} else {
			this.path2Ele[this.to.path].classList.add('active');
		}

		this.curActive = this.to.path;
	}

	_pathChange(parame) {

		if (!this.routes.length) {
			return;
		}
		let from = parame.from;
		let to = parame.to;
		const lastIndex = this.beforeEachFuncs.length - 1;
		const routesLastIndex = this.routes.length - 1;
		const routeState = {
			from,
			to,
			params: {},
			query: {}
		};

		const toPath = to.fullPath;
		if (toPath.indexOf('?') >= 0) {
			toPath.split('?')[1].split('&').forEach(query => {
				const split = query.split('=');
				const key = split[0];
				const value = split[1];
				try {
					routeState.query[key] = window.decodeURIComponent(value);
				} catch (e) {
					routeState.query[key] = value;
				}
			});
		}

		for (let i = 0; i <= routesLastIndex; i++) {
			const route = this.routes[i];
			let isMatchRoute = false;

			if (this.pathName === route.path) {
				isMatchRoute = true;
			} else if (/:\w+/.test(route.path)) {
				const paramsMatches = route.path.match(/:(\w+)/g);
				const pathRegex = route.path.replace(/(:\w+)/g, '([^\/?]+)');
				const pathMatches = new RegExp(pathRegex).exec(this.pathName);
				// console.log(paramsMatches, pathRegex, pathMatches);
				if (pathMatches && pathMatches.length) {
					isMatchRoute = true;
					for (let i = 0; i < paramsMatches.length; i++) {
						const param = paramsMatches[i].replace(':', '');
						try {
							routeState.params[param] = window.decodeURIComponent(pathMatches[i + 1]);
						} catch (e) {
							routeState.params[param] = pathMatches[i + 1];
						}
					}
				}
			}

			if (!isMatchRoute) {
				continue;
			}

			// Excute beforeEach functions
			if (this.beforeEachFuncs.length) {
				// beforeEach functions chain
				let index = 0;
				const next = () => {
					// console.log(index);
					if (index < lastIndex) {
						this.beforeEachFuncs[++index](from, to, next);
					} else {
						route.handler(routeState);
					}
				};
				this.beforeEachFuncs[0](from, to, next);
			} else {
				route.handler(routeState);
			}

			if (this.afterEachFuncs.length) {
				for (let j = 0; j < this.afterEachFuncs.length; j++) {
					this.afterEachFuncs[j](from, to);
				}
			}

			this.redirectDelay && clearTimeout(this.redirectDelay);
			if (route.redirect) {
				// Give u a little time to go back
				this.redirectDelay = setTimeout(() => {
					this._updatePath(route.redirect);
					this.redirectDelay = null;
				}, 200);
			}

			return;
		}

		// 404 page
		if (this.beforeEachFuncs.length) {
			// beforeEach functions chain
			let index = 0;
			const next = () => {
				// console.log(index);
				if (index < lastIndex) {
					this.beforeEachFuncs[++index](from, to, next, '404');
				} else {
					this.page404(routeState);
				}
			};
			this.beforeEachFuncs[0](from, to, next, '404');
		} else {
			this.page404(routeState);
		}
	}

	_updatePath(newPath) {
		if (!this.historyMod) {
			window.location.hash = '!' + newPath;
		} else {
			this._pushState({ path: newPath }, newPath, newPath);
		}
	}

	beforeEach(func) {
		this.beforeEachFuncs.push(func);
		return this;
	}

	afterEach(func) {
		this.afterEachFuncs.push(func);
		return this;
	}

	back() {
		this.go(-1);
	}

	forward() {
		this.go(1);
	}

	go(count) {

		this.isControlling = true;

		count = ~~count;
		if (count < 0 && this.historyAnchor === 0 || count > 0 && this.historyAnchor === this.history.length - 1) {
			return;
		}

		let historyOffset = this.historyAnchor + count;
		if (count > 0) {
			historyOffset = historyOffset > this.history.length - 1 ? this.history.length - 1 : historyOffset;
		}
		if (count < 0) {
			historyOffset = historyOffset < 0 ? 0 : historyOffset;
		}
		this.historyAnchor = historyOffset;

		const newPath = this.history[historyOffset];
		this._updatePath(newPath);
	}

	push(newPath) {
		this._updatePath(newPath);
	}
}

/* harmony default export */ __webpack_exports__["default"] = (GeeRouter);
// module.exports = GeeRouter;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _GeeRouter = __webpack_require__(0);

var _GeeRouter2 = _interopRequireDefault(_GeeRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var historyMod = localStorage.getItem('history') === 'true' || false;
var container = document.querySelector('.container');
var handlers = {
	home: function home() {
		container.innerText = 'Home';
	},
	post: function post() {
		container.innerText = 'Post';
	},
	notFound: function notFound() {
		container.innerText = '404';
	},
	article: function article($route) {
		container.innerHTML = '<pre style="font-size: 14px">' + JSON.stringify($route, null, '\t') + '</pre>';
	}
};
var geerouter = new _GeeRouter2.default([{
	path: '/',
	handler: handlers.home
}, {
	path: '/post',
	handler: handlers.post,
	default: true
}, {
	path: '/article/:id/:title',
	handler: handlers.article
}, {
	path: '/gallery/:id',
	handler: handlers.article
}, {
	path: '/redirect',
	handler: function handler() {},
	redirect: '/'
}, {
	path: '*',
	handler: handlers.notFound
}], historyMod);
geerouter.parse(document.querySelectorAll('a'));
geerouter.start();

document.querySelector('.back').addEventListener('click', function (e) {
	geerouter.back();
});

document.querySelector('.forward').addEventListener('click', function (e) {
	geerouter.forward();
});

window.geerouter = geerouter;

/***/ })
/******/ ]);