# tslint-teamcity-reporter

Add a description here...

[![Travis](https://img.shields.io/travis/mediamonks/tslint-teamcity-reporter.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/tslint-teamcity-reporter)
[![Code Climate](https://img.shields.io/codeclimate/github/mediamonks/tslint-teamcity-reporter.svg?maxAge=2592000)](https://codeclimate.com/github/mediamonks/tslint-teamcity-reporter)
[![Coveralls](https://img.shields.io/coveralls/mediamonks/tslint-teamcity-reporter.svg?maxAge=2592000)](https://coveralls.io/github/mediamonks/tslint-teamcity-reporter?branch=master)
[![npm](https://img.shields.io/npm/v/tslint-teamcity-reporter.svg?maxAge=2592000)](https://www.npmjs.com/package/tslint-teamcity-reporter)
[![npm](https://img.shields.io/npm/dm/tslint-teamcity-reporter.svg?maxAge=2592000)](https://www.npmjs.com/package/tslint-teamcity-reporter)

## Installation

```sh
yarn add tslint-teamcity-reporter
```

```sh
npm i -S tslint-teamcity-reporter
```


## Basic Usage

```ts
import TslintTeamcityReporter from 'tslint-teamcity-reporter';
// import TslintTeamcityReporter from 'tslint-teamcity-reporter/lib/classname';

// do something with TslintTeamcityReporter
```


## Documentation

View the [generated documentation](http://mediamonks.github.io/tslint-teamcity-reporter/).


## Building

In order to build tslint-teamcity-reporter, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/tslint-teamcity-reporter.git
```

Change to the tslint-teamcity-reporter directory:
```sh
cd tslint-teamcity-reporter
```

Install dev dependencies:
```sh
yarn
```

Use one of the following main scripts:
```sh
yarn build            # build this project
yarn dev              # run compilers in watch mode, both for babel and typescript
yarn test             # run the unit tests incl coverage
yarn test:dev         # run the unit tests in watch mode
yarn lint             # run eslint and tslint on this project
yarn doc              # generate typedoc documentation
```

When installing this module, it adds a pre-commit hook, that runs lint and prettier commands
before committing, so you can be sure that everything checks out.


## Contribute

View [CONTRIBUTING.md](./CONTRIBUTING.md)


## Changelog

View [CHANGELOG.md](./CHANGELOG.md)


## Authors

View [AUTHORS.md](./AUTHORS.md)


## LICENSE

[MIT](./LICENSE) © MediaMonks


