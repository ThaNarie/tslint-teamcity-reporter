[![Build Status](https://secure.travis-ci.org/ThaNarie/tslint-teamcity-reporter.png?branch=master)](http://travis-ci.org/ThaNarie/tslint-teamcity-reporter) [![Dependency Status](https://gemnasium.com/ThaNarie/tslint-teamcity-reporter.png)](https://gemnasium.com/ThaNarie/tslint-teamcity-reporter) [![NPM version](https://badge.fury.io/js/tslint-teamcity-reporter.png)](http://badge.fury.io/js/tslint-teamcity-reporter)

## TSLint TeamCity Reporter

A TSLint formatter/reporter for use in TeamCity which groups by files using TeamCity Test Suite

### Install

Install with npm: `npm install --save-dev tslint-teamcity-reporter`

### Usage

Use it with:

#### JSHint CLI

```
jshint --reporter node_modules/tslint-teamcity-reporter/teamcity.js file.js
```

#### grunt-tslint

```javascript
grunt.initConfig({
	tslint: {
		options: {
			formatter: 'tslint-teamcity-reporter'
		},
		files: {
      src: ['**/*.ts']
    }
	}
});

grunt.loadNpmTasks('tslint-teamcity-reporter');
grunt.registerTask('default', ['tslint']);
```

### Screenshot

<img src="http://cl.ly/UJnl/Screenshot%202014-02-20%2012.12.17.png" title="This is how it looks like in TeamCity">

### License

Thanks to [jshint-teamcity](https://github.com/hongymagic/jshint-teamcity) and [tslint-path-formatter](https://github.com/Bartvds/tslint-path-formatter).

MIT © Tha Narie