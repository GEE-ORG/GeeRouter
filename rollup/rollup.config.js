import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

const babelConf = {
	exclude: 'node_modules/**'
}

export default {
	entry: 'GeeRouter.js',
	moduleName: 'GeeRouter',
	dest: '../lib/GeeRouter.min.js',
	format: 'umd',
	plugins: [
		resolve(),
		babel(),
		uglify({})
	]
}