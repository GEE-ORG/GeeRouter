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