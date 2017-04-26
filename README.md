![GeeRouter](https://gongpeione.github.io/GeeRouter/example/logo.svg)

# GeeRouter - A simple front-end router

[![](https://img.shields.io/badge/npm-1.0.6-blue.svg)](https://www.npmjs.com/package/gee-router)

## Demo

https://gongpeione.github.io/GeeRouter/example

## Usage

```bash
yarn add gee-router --save
```

If you prefer npm

```bash
npm install gee-router --save
```

Or you can just use `script` to import GeeRouter like this:

```javascript
<script src="path/to/GeeRouter.js"></script>
```

Here is a codepen demo: https://codepen.io/gongpeione/pen/BRjMwV

### Import and use GeeRouter
```html
...
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/post">Post</a></li>
        <li><a href="/aaaa">AAAA</a></li>
        <li><a href="/post">Post</a></li>
        <li><a href="/article/111/Title">Article</a></li>
        <li><a href="/gallery/222">Gallery</a></li>
    </ul>
</nav>
<div class="container"></div>
<div class="control">
    <div class="back"><</div>
    <div class="forward">></div>
</div>
<div class="mod">
    <label for="history">History Mod</label>
    <input type="checkbox" id="history">
    <span></span>
</div>

<script>
    var originalUrl = location.href;
</script>
<script src="bundle.js"></script>
<script>
    const history = document.querySelector('#history');
    history.checked = localStorage.getItem('history') === 'true' || false;
    history.addEventListener('change', function (e) {
        if (this.checked) {
            localStorage.setItem('history', true);
        } else {
            localStorage.setItem('history', false);
        }
        setTimeout(() => {
            location.href = originalUrl;
        }, 400);
    });
</script>
...
```
```javascript
import GeeRouter from './GeeRouter';
// import GeeRouter from 'gee-router';

const historyMod = localStorage.getItem('history') === 'true' || false;
const container = document.querySelector('.container');
const handlers = {
	home: () => {
		container.innerText = 'Home'
	},
	post: () => {
		container.innerText = 'Post'
	},
	notFound: () => {
		container.innerText = '404'
	},
	article: ($route) => {
		container.innerHTML = `<pre style="font-size: 14px">${JSON.stringify($route, null, '\t')}</pre>`;
	}
}
const geerouter = new GeeRouter([
	{
		path: '/',
		handler: handlers.home
	},
	{
		path: '/post',
		handler: handlers.post,
		default: true
	},
	{
		path: '/article/:id/:title',
		handler: handlers.article,
	},
	{
		path: '/gallery/:id',
		handler: handlers.article,
	},
	{
		path: '*',
		handler: handlers.notFound
	}
], historyMod);
geerouter.parse(document.querySelectorAll('a'));
geerouter.start();

document.querySelector('.back').addEventListener('click', e => {
	geerouter.back();
});

document.querySelector('.forward').addEventListener('click', e => {
	geerouter.forward();
});
```

## TODO

- [ ] Nested Routes
- [x] Programmatic Navigation
- [x] Redirect