const path = require('path');

module.exports = {
	entry: path.resolve('./', 'index.js'),
	output: {
		filename: 'bundle.js'
	},
	resolve: {
		alias: {
			'~': path.resolve('../')
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
					}
				]
			}
		]
	}
}