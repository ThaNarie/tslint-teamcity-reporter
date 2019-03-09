import * as path from 'path';

import { RuleFailure } from 'tslint';
import { getOutputMessage, TeamCityMessages } from '../util';

export function formatAsInspections(failures: RuleFailure[], config: { [key: string]: string }) {
  const { reportName } = config;

  const output = [];
  let errorCount = 0;
  let warningCount = 0;

  // group failures per file, instead of reporting each failure individually
  const failuresByRule = failures.reduce<{
    [key: string]: { ruleName?: string; messages?: Array<RuleFailure> };
  }>((acc, f) => {
    const ruleName = f.getRuleName();
    if (!acc[ruleName]) acc[ruleName] = { ruleName, messages: [] };
    acc[ruleName].messages.push(f);
    return acc;
  }, {});

  Object.values(failuresByRule).forEach(result => {
    output.push(
      getOutputMessage(TeamCityMessages.INSPECTION_TYPE, { reportName, ruleName: result.ruleName }),
    );

    result.messages.forEach(failure => {
      const filePath = path.relative(process.cwd(), failure.getFileName());
      const startPos = failure.getStartPosition().getLineAndCharacter();
      const formattedMessage = `line ${startPos.line}, col ${
        startPos.character
      }, ${failure.getFailure()}`;

      const isError = failure.getRuleSeverity() === 'error';
      const severity = isError ? 'ERROR' : 'WARNING';
      if (isError) {
        errorCount += 1;
      } else {
        warningCount += 1;
      }
      output.push(
        getOutputMessage(TeamCityMessages.INSPECTION, {
          formattedMessage,
          filePath,
          severity,
          ruleName: result.ruleName,
          line: startPos.line,
        }),
      );
    });
  });

  output.push(
    ...(<Array<string>>getOutputMessage(TeamCityMessages.BUILD_STATISTIC_VALUE, {
      [config.errorStatisticsName]: errorCount,
      [config.warningStatisticsName]: warningCount,
    })),
  );

  return output.join('\n');
}
