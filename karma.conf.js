module.exports = function(config) {
	config.set({


		basePath: '.',
		logLevel: config.LOG_DEBUG,
		frameworks: ['systemjs', 'mocha', 'chai', 'chai-as-promised', 'sinon-chai'],

		plugins: [
			'karma-mocha',
			'karma-chai',
			'karma-chai-plugins',
			'karma-systemjs',
			'karma-chrome-launcher',
			'karma-phantomjs-launcher',
			'karma-spec-reporter'
		],

		systemjs: {
			configFile: 'config.js',
			testFileSuffix: 'Spec.js',
			files: [
				'vendor/**/**',
				'vendor/github/*',
				'vendor/npm/*',
				'test/**/*',
				'test/**/*Spec.js',
				'src/js/**/*.*'
			],
			config: {
				baseURL: "/",
				paths: {
					'es6-module-loader': 'vendor/es6-module-loader.js',
					'systemjs': 'vendor/system.js',
					"github:*": "vendor/github/*.js",
					"npm:*": "vendor/npm/*.js"
				},
				"meta": {
					"github:marionettejs/backbone.marionette@2.4.1/lib/core/backbone.marionette": {
						"format": "amd",
						"deps": [ "src/app/js/common/shims/marionette-shim" ]
					},
					"di-lite": {
						"format": [ "global" ]
					}
				}
			}
		},


		browsers: ['PhantomJS'],
		reporters: ['spec'],


		singleRun: false,
		colors: true,
		files: [],
		exclude: []

	});
};
