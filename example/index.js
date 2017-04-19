import GeeRouter from './GeeRouter';
// import GeeRouter from 'gee-router';

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