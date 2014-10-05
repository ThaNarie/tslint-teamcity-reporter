'use strict';

describe('tslint-teamcity-reporter', function () {

	var grunt = require('grunt');
	var assert = require('chai').assert;

	it('should format failures correctly', function () {
		var actual = grunt.file.read('./tmp/output.txt').replace(/\r?\n/g, '\n').replace(/\s$/, '');
		var expected = grunt.file.read('./test/fixtures/files/output.txt').replace(/\r?\n/g, '\n').replace(/\s$/, '');

		assert.equal(actual, expected);
	});
});
