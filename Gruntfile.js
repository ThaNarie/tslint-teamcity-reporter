module.exports = function (grunt) {
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-run-grunt');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-continue');

	var path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			//merge reporter into jshint
			options: grunt.util._.defaults(grunt.file.readJSON('.jshintrc'), {
				reporter: './node_modules/jshint-path-reporter'
			}),
			all: [
				'Gruntfile.js',
				'index.js',
				'test/**/*.js'
			]
		},
		clean: {
			tmp: ['./tmp/**/*', './test/tmp/**/*']
		},
		run_grunt: {
			test: {
				options: {
					log: false,
					expectFail: true,
					'no-color': true,
					logFile: './tmp/output-raw.txt',
					process: function (res) {
						var p = path.resolve('./test/fixtures/files/') + path.sep;
						//why does .replace() only work once? weird
						var actual = res.res.stdout.split(p).join('{{full}}');
						grunt.file.write('./tmp/output.txt', actual);
					}
				},
				src: ['test/Gruntfile.js']
			}
		},
		tslint: {
			demo: {
				options: {
					configuration: grunt.file.readJSON('./test/fixtures/tslint.json'),
					formatter: path.resolve('./teamcity')
				},
				src: ['./test/fixtures/files/**/*.ts']
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'mocha-unfunk-reporter'
				},
				src: ['./test/*.test.js']
			}
		}
	});
	grunt.registerTask('default', ['test']);
	grunt.registerTask('test', ['clean', 'jshint', 'run_grunt:test', 'mochaTest:test', 'continueOn', 'tslint:demo', 'continueOff']);
	grunt.registerTask('dev', ['clean', 'jshint', 'tslint:demo']);

};