const fs = require('fs');

export enum TeamCityMessages {
  TEST_SUITE_STARTED = 'testSuiteStarted',
  TEST_SUITE_FINISHED = 'testSuiteFinished',
  TEST_STARTED = 'testStarted',
  TEST_FINISHED = 'testFinished',
  TEST_STD_OUT = 'testStdOut',
  TEST_STD_ERR = 'testStdErr',
  TEST_IGNORED = 'testIgnored',
  TEST_FAILED = 'testFailed',
  BUILD_STATISTIC_VALUE = 'buildStatisticValue',
  INSPECTION_TYPE = 'inspectionType',
  INSPECTION = 'inspection',
}

export type GetOutputMessageOptions = {
  report?: string;
  file?: string;
  errors?: string;
  warnings?: string;
  reportName?: string;
  ruleName?: string;
  formattedMessage?: string;
  filePath?: string;
  line?: number;
  severity?: 'ERROR' | 'WARNING';
  [key: string]: string | number;
};

const messages = {
  [TeamCityMessages.TEST_SUITE_STARTED]: (type, { report }) =>
    `##teamcity[${type} name='${report}']`,

  [TeamCityMessages.TEST_SUITE_FINISHED]: (type, { report }) =>
    `##teamcity[${type} name='${report}']`,

  [TeamCityMessages.TEST_STARTED]: (type, { report, file }) =>
    `##teamcity[${type} name='${report}: ${file}']`,

  [TeamCityMessages.TEST_FINISHED]: (type, { report, file }) =>
    `##teamcity[${type} name='${report}: ${file}']`,

  [TeamCityMessages.TEST_FAILED]: (type, { report, file, errors }) =>
    `##teamcity[${type} name='${report}: ${file}' message='${errors}']`,

  [TeamCityMessages.TEST_STD_OUT]: (type, { report, file, warnings }) =>
    `##teamcity[${type} name='${report}: ${file}' out='warning: ${warnings}']`,

  [TeamCityMessages.BUILD_STATISTIC_VALUE]: (type, values) =>
    Object.keys(values).map(key => `##teamcity[${type} key='${key}' value='${values[key]}']`),

  [TeamCityMessages.INSPECTION_TYPE]: (type, { reportName, ruleName }) =>
    `##teamcity[${type} id='${ruleName}' category='${reportName}' name='${ruleName}' description='${reportName}']`,

  [TeamCityMessages.INSPECTION]: (type, { ruleName, formattedMessage, filePath, line, severity }) =>
    `##teamcity[${type} typeId='${ruleName}' message='${formattedMessage}' file='${filePath}' line='${line}' SEVERITY='${severity}']`,
};

export function getOutputMessage(type, options: GetOutputMessageOptions): string | Array<string> {
  if (messages[type]) {
    return messages[type](
      type,
      Object.keys(options).reduce(
        (acc, key) => ({ ...acc, [key]: escapeTeamCityString(String(options[key])) }),
        {},
      ),
    );
  }
  return '';
}

/**
 * Attempt to load package.json within the current directory.
 * @returns {string} The string representation of package.json
 */
export function loadPackageJson() {
  try {
    return fs.readFileSync('package.json');
  } catch (e) {
    // tslint:disable-next-line no-console
    console.warn('Unable to load config from package.json');
    // Return the string representation of an empty JSON object,
    // as it will be parsed outside of this method
    return '{}';
  }
}

/**
 * Escape special characters with the respective TeamCity escaping.
 * See below link for list of special characters:
 * https://confluence.jetbrains.com/display/TCD10/Build+Script+Interaction+with+TeamCity
 * @param {string} str The raw message to display in TeamCity build log.
 * @returns {string} An error message formatted for display in TeamCity
 */
export function escapeTeamCityString(str) {
  if (!str) {
    return '';
  }

  return str
    .replace(/\|/g, '||')
    .replace(/'/g, "|'")
    .replace(/\n/g, '|n')
    .replace(/\r/g, '|r')
    .replace(/\u0085/g, '|x') // TeamCity 6
    .replace(/\u2028/g, '|l') // TeamCity 6
    .replace(/\u2029/g, '|p') // TeamCity 6
    .replace(/\[/g, '|[')
    .replace(/\]/g, '|]');
}

/**
 * Determines the config to be used by the respective formatter
 * Config is selected based on the following priority:
 *    1. Any user defined props when running eslint-teamcity
 *    2. package.json settings
 *    3. ENV variables
 *    4. Default value
 * @param {object} propNames Optional config variables that will override all other config settings
 * @returns {object} The final config settings to be used
 */
export function getUserConfig(propNames): { [key: string]: string } {
  // Attempt to load package.json from current directory
  const config = JSON.parse(loadPackageJson())['tslint-teamcity-reporter'] || {};

  const reporter =
    propNames.reporter || config.reporter || process.env.TSLINT_TEAMCITY_REPORTER || 'errors';

  const reportName =
    propNames.reportName ||
    config['report-name'] ||
    process.env.TSLINT_TEAMCITY_REPORT_NAME ||
    'TSLint Violations';

  const errorStatisticsName =
    propNames.errorStatisticsName ||
    config['error-statistics-name'] ||
    process.env.TSLINT_TEAMCITY_ERROR_STATISTICS_NAME ||
    'TSLint Error Count';

  const warningStatisticsName =
    propNames.warningStatisticsName ||
    config['warning-statistics-name'] ||
    process.env.TSLINT_TEAMCITY_WARNING_STATISTICS_NAME ||
    'TSLint Warning Count';

  return {
    reporter,
    reportName: escapeTeamCityString(reportName),
    errorStatisticsName: escapeTeamCityString(errorStatisticsName),
    warningStatisticsName: escapeTeamCityString(warningStatisticsName),
  };
}
