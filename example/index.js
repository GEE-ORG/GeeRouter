import GeeRouter from './GeeRouter';

const container = document.querySelector('.container');
const handlers = {
	home: () => {
		container.innerText = 'Home'
	},
	test: () => {
		container.innerText = 'Test'
	}
}
const geerouter = new GeeRouter([
	{
		path: '/',
		handler: handlers.home
	},
	{
		path: '/test',
		handler: handlers.test,
		default: true
	}
]);
geerouter.parse(document.querySelectorAll('a'));
geerouter.start();
console.log(geerouter);