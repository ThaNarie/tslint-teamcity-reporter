const gulp = require('gulp');
const tslint = require('gulp-tslint');

gulp.task('tslint', () =>
  gulp
    .src('../_fixtures/*.ts')
    .pipe(
      tslint({
        configuration: '../_fixtures/tslint.json',
        formatter: 'tslint-teamcity-reporter',
        formattersDirectory: 'anything-but-falsy', // passing a falsy value will resolve in `null` and throw an error in tslint
      }),
    )
    .pipe(tslint.report()),
);

gulp.task('default', ['tslint']);
