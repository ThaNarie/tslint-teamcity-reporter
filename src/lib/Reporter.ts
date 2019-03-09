import { AbstractFormatter } from 'tslint/lib/language/formatter/abstractFormatter';
import { RuleFailure, IFormatterMetadata } from 'tslint';
import { getUserConfig } from './util';
import { formatAsInspections } from './formatters/inspections';
import { formatAsTests } from './formatters/errors';

export class Formatter extends AbstractFormatter {
  /* tslint:disable:object-literal-sort-keys */
  public static metadata: IFormatterMetadata = {
    formatterName: 'json',
    description: 'Formats errors as TeamCity report.',
    sample: `
##teamcity[testSuiteStarted name='TSLint Violations']
##teamcity[testStarted name='TSLint Violations: test1.ts']
##teamcity[testFailed name='TSLint Violations: test1.ts' message='line 0, col 0, first failure (first-name)|nline 8, col 1, last failure (last-name)']
##teamcity[testStdOut name='TSLint Violations: test1.ts' out='warning: line 0, col 0, full failure (full-name)']
##teamcity[testFinished name='TSLint Violations: test1.ts']
##teamcity[testStarted name='TSLint Violations: test2.ts']
##teamcity[testStdOut name='TSLint Violations: test2.ts' out='warning: line 8, col 1, full failure (full-name)']
##teamcity[testFinished name='TSLint Violations: test2.ts']
##teamcity[testSuiteFinished name='TSLint Violations']
##teamcity[buildStatisticValue key='TSLint Error Count' value='2']
##teamcity[buildStatisticValue key='TSLint Warning Count' value='2']`.slice(1),
    consumer: 'machine',
  };
  /* tslint:enable:object-literal-sort-keys */

  public format(failures: RuleFailure[], config: { [key: string]: string } = {}): string {
    const userConfig = getUserConfig(config);

    if (process.env.TSLINT_TEAMCITY_DISPLAY_CONFIG) {
      // tslint:disable-next-line no-console
      console.info(`Running TSLint Teamcity with config: ${JSON.stringify(userConfig, null, 4)}`);
    }

    let outputMessage = '';
    switch (userConfig.reporter.toLowerCase()) {
      case 'inspections':
        outputMessage = formatAsInspections(failures, userConfig);
        break;
      case 'errors':
      default:
        outputMessage = formatAsTests(failures, userConfig);
        break;
    }

    return outputMessage;
  }
}
