/**
 * Created by geeku on 19/04/2017.
 */

// TODO dynamic parame, History mod.
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
		this.firstPage();
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
			const path = node.pathname;
			if (this.historyMod) {
				node.addEventListener('click', e => {
					e.preventDefault();
					this._pushState({ path: path }, path, path);
				});
			} else {
				node.setAttribute('href', '#!' + path);
			}

			if (this.path2Ele[path]) {
				this.path2Ele[path] = [this.path2Ele[path]];
				this.path2Ele[path].push(node);
			} else {
				this.path2Ele[path] = node;
			}
		});
	}

	firstPage () {
		if (this.historyMod) {
			this.defaultPath && this._pushState({ path: this.defaultPath}, null, this.defaultPath);
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

		this.from.path = this.pathName;
		this.from.fullPath = `${this.origin}#!${this.pathName}`;

		this._hash = newVal;

		this.to.path = this.pathName;
		this.to.fullPath = `${this.origin}#!${this.pathName}`;

		if (!this.isControlling) {
			this.history.push(this.pathName);
			this.historyAnchor = this.history.length - 1;
		} else {
			this.isControlling = false;
		}

		this.pathChange ({ from: this.from, to: this.to });

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

	pathChange (parame) {

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

		for (let i = 0; i <= routesLastIndex; i++) {
			const route = this.routes[i];
			let isMatchRoute = false;

			if (this.pathName === route.path) {
				isMatchRoute = true;
			} else if (/:\w+/.test(route.path)) {
				const paramsMatches = route.path.match(/:(\w+)/g);
				const pathRegex = route.path.replace(/(:\w+)/g, '([^\/]+)');
				const pathMatches = (new RegExp(pathRegex)).exec(this.pathName);
				// console.log(paramsMatches, pathRegex, pathMatches);
				if (pathMatches  && pathMatches.length) {
					isMatchRoute = true;
					for (let i = 0; i < paramsMatches.length; i++) {
						const param = paramsMatches[i].replace(':', '');
						routeState.params[param] = pathMatches[i + 1];
					}
					console.log(routeState);
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
					this.afterEachFuncs[j]();
				}
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

	beforeEach (func) {
		this.beforeEachFuncs.push(func);
		func(this.from, this.to, () => {});

		return this;
	}

	afterEach (func) {
		this.afterEachFuncs.push(func);
		func(this.from, this.to);

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
		console.log(this.history);
		count = ~~count;
		if (count < 0 && this.historyAnchor === 0) {
			return;
		}
		if (count > 0 && this.historyAnchor === this.history.length - 1) {
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

		window.location.hash = '!' + this.history[historyOffset];
	}
}

export default GeeRouter;
// module.exports = GeeRouter;