import * as path from 'path';

import { RuleFailure } from 'tslint';
import { getOutputMessage, TeamCityMessages } from '../util';

export function formatAsTests(failures: RuleFailure[], config: { [key: string]: string }) {
  const { reportName } = config;

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
      if (!isError) {
        warningsList.push(formattedMessage);
        warningCount += 1;
      } else {
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
