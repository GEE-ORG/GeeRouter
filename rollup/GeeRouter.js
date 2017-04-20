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

		this.historyMod = historyMod;
		this.history = [];
		this.historyAnchor = -1;

		this.beforeEachFuncs = [];
		this.afterEachFuncs = [];

		this.origin = location.protocol + '//' + location.host + location.pathname;

		this.routes = routes;

		this.defaultPath = '/';
		this.page404 = () => {};

		this.path2Ele = {};
		this.curActive = null;

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
					this._pushState({ path: path }, null, path);
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

		this.history.push(this.pathName);
		this.historyAnchor += 1;

		this.hashChange ({ from: this.from, to: this.to });

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

	hashChange (parame) {

		if (this.routes.length) {

			let from = parame.from;
			let to = parame.to;
			const lastIndex = this.beforeEachFuncs.length - 1;
			const routesLastIndex = this.routes.length - 1;

			for (let i = 0; i <= routesLastIndex; i++) {
				const route = this.routes[i];

				if (this.pathName === route.path) {
					// Excute beforeEach functions
					if (this.beforeEachFuncs.length) {
						// beforeEach functions chain
						let index = 0;
						const next = () => {
							// console.log(index);
							if (index < lastIndex) {
								this.beforeEachFuncs[++index](from, to, next);
							} else {
								route.handler({ from, to });
							}
						}
						this.beforeEachFuncs[0](from, to, next);

					} else {
						route.handler({ from, to });
					}

					if (this.afterEachFuncs.length) {
						for (let j = 0; j < this.afterEachFuncs.length; j++) {
							this.afterEachFuncs[j]();
						}
					}

					return;
				}
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
						this.page404({ from, to });
					}
				}
				this.beforeEachFuncs[0](from, to, next, '404');

			} else {
				this.page404({ from, to });
			}
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
		if (this.history.length < 2) {
			return;
		}
		this.pathName = this.history[this.historyAnchor - 1];
	}

	go (cout) {
		if (cout > 0 && (this.history.length - 1 - this.historyAnchor) >= cout) {
			this.pathName = this.history[this.historyAnchor - cout];
		}

		if (cout < 0 && this.historyAnchor >= Math.abs(cout)) {
			this.pathName = this.history[this.historyAnchor + cout];
		}
	}
}

export default GeeRouter;
// module.exports = GeeRouter;