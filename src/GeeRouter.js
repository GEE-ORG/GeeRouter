/**
 * Created by geeku on 19/04/2017.
 */

class GeeRouter {
	constructor (routes = [], historyMod = false) {
		this._hash = '';
		this.from = {
			path: '',
			fullPath: location.href
		};
		this.to = {
			path: '',
			fullPath: location.href
		};

		this.historyMod = ('pushState' in window.history) ? historyMod : false;
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

	start () {
		if (this.historyMod) {
			window.addEventListener('popstate', e => {
				const path = e.state && e.state.path;
				if  (path) {
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

	parse (nodelist) {
		if (typeof nodelist === 'string') {
			nodelist = document.querySelectorAll(nodelist);
		}
		if (!(
				nodelist instanceof NodeList ||
				nodelist instanceof HTMLCollection ||
				nodelist instanceof Node
			)) {
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

	_firstPage () {
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

	_pushState (state = {}, title = null, url = '') {
		window.history.pushState(state, title, url);
		this.pathName = url;
	}

	get pathName () {
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

		this._pathChange ({ from: this.from, to: this.to });

		if (this.curActive) {
			if (Array.isArray(this.path2Ele[this.curActive])) {
				this.path2Ele[this.curActive].forEach(el => {
					el.classList.remove('active');
				})
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

	_pathChange (parame) {

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
				const pathMatches = (new RegExp(pathRegex)).exec(this.pathName);
				// console.log(paramsMatches, pathRegex, pathMatches);
				if (pathMatches  && pathMatches.length) {
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
				}
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
			}
			this.beforeEachFuncs[0](from, to, next, '404');

		} else {
			this.page404(routeState);
		}
	}

	_updatePath (newPath) {
		if (!this.historyMod) {
			window.location.hash = '!' + newPath;
		} else {
			this._pushState({ path: newPath }, newPath, newPath);
		}
	}

	beforeEach (func) {
		this.beforeEachFuncs.push(func);
		return this;
	}

	afterEach (func) {
		this.afterEachFuncs.push(func);
		return this;
	}

	back () {
		this.go(-1);
	}

	forward () {
		this.go(1);
	}

	go (count) {

		this.isControlling = true;

		count = ~~count;
		if (
			(count < 0 && this.historyAnchor === 0) ||
			(count > 0 && this.historyAnchor === this.history.length - 1)
		) {
			return;
		}

		let historyOffset = this.historyAnchor + count;
		if (count > 0) {
			historyOffset = historyOffset > (this.history.length - 1) ? this.history.length - 1 : historyOffset;
		}
		if (count < 0) {
			historyOffset = historyOffset < 0 ? 0 : historyOffset;
		}
		this.historyAnchor = historyOffset;

		const newPath = this.history[historyOffset];
		this._updatePath(newPath);

	}

	push (newPath) {
		this._updatePath(newPath);
	}
}

export default GeeRouter;
// module.exports = GeeRouter;