import * as path from 'path';
import { AbstractFormatter } from 'tslint/lib/language/formatter/abstractFormatter';
import { RuleFailure, IFormatterMetadata } from 'tslint';
import { getOutputMessage, getUserConfig, TeamCityMessages } from './util';

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

  public format(failures: RuleFailure[]): string {
    const config = getUserConfig({});
    const { reportName } = config;

    if (process.env.TSLINT_TEAMCITY_DISPLAY_CONFIG) {
      // tslint:disable-next-line no-console
      console.info(`Running TSLint Teamcity with config: ${JSON.stringify(config, null, 4)}`);
    }

    const output = [];
    let errorCount = 0;
    let warningCount = 0;

    output.push(getOutputMessage(TeamCityMessages.TEST_SUITE_STARTED, { report: reportName }));

    // group failures per file, instead of reporting each failure individually
    const failuresByFile = failures.reduce<{
      [key: string]: { filePath?: string; messages?: Array<RuleFailure> };
    }>((acc, f) => {
      const file = f.getFileName();
      if (!acc[file]) acc[file] = { filePath: file, messages: [] };
      acc[file].messages.push(f);
      return acc;
    }, {});

    Object.values(failuresByFile).forEach(result => {
      const filePath = path.relative(process.cwd(), result.filePath);
      output.push(
        getOutputMessage(TeamCityMessages.TEST_STARTED, { report: reportName, file: filePath }),
      );

      const errorsList = [];
      const warningsList = [];

      result.messages.forEach(failure => {
        const startPos = failure.getStartPosition().getLineAndCharacter();
        const formattedMessage = `line ${startPos.line}, col ${
          startPos.character
          }, ${failure.getFailure()} (${failure.getRuleName()})`;

        const isError = failure.getRuleSeverity() === 'error';
        if (!isError)
        {
          warningsList.push(formattedMessage);
          warningCount += 1;
        } else
        {
          errorsList.push(formattedMessage);
          errorCount += 1;
        }
      });

      // Group errors and warnings together per file
      if (errorsList.length) {
        const errors = errorsList.join('\n');
        output.push(
          getOutputMessage(TeamCityMessages.TEST_FAILED, {
            errors,
            report: reportName,
            file: filePath,
          }),
        );
      }

      if (warningsList.length) {
        const warnings = warningsList.join('\n');
        output.push(
          getOutputMessage(TeamCityMessages.TEST_STD_OUT, {
            warnings,
            report: reportName,
            file: filePath,
          }),
        );
      }

      output.push(
        getOutputMessage(TeamCityMessages.TEST_FINISHED, { report: reportName, file: filePath }),
      );
    });

    output.push(getOutputMessage(TeamCityMessages.TEST_SUITE_FINISHED, { report: reportName }));

    output.push(
      ...(<Array<string>>getOutputMessage(TeamCityMessages.BUILD_STATISTIC_VALUE, {
        [config.errorStatisticsName]: errorCount,
        [config.warningStatisticsName]: warningCount,
      })),
    );

    return output.join('\n');
  }
}
