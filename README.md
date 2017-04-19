# GeeRouter - A simple front-end router

[![](https://img.shields.io/badge/npm-1.0.0-blue.svg)](https://www.npmjs.com/package/gee-router)

## Demo

https://gongpeione.github.io/GeeRouter/example

## Usage

```bash
yarn add gee-router --save
```

if you prefer npm

```bash
npm install gee-router --save
```

### Import and use GMD
```html
...
<nav>
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/post">Post</a></li>
        <li><a href="/aaaa">AAAA</a></li>
        <li><a href="/post">Post</a></li>
    </ul>
</nav>
<div class="container"></div>

<script src="bundle.js"></script>
...
```
```javascript
import GeeRouter from 'gee-router';

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
		path: '*',
		handler: handlers.notFound
	}
]);
geerouter.parse(document.querySelectorAll('a'));
geerouter.start();
```
