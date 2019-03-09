import {
  escapeTeamCityString,
  getOutputMessage,
  loadPackageJson,
  TeamCityMessages,
} from '../../src/lib/util';

const fs = require('fs');
const { expect } = require('chai');
const sinon = require('sinon');

describe('utils', () => {
  describe('loadPackageJson', () => {
    context('success', () => {
      it('returns a string representation of package.json', () => {
        sinon.stub(fs, 'readFileSync').callsFake(() => 'package.json contents');
        expect(loadPackageJson()).to.eql('package.json contents');
        fs.readFileSync.restore();
      });
    });

    context('failure', () => {
      it('returns an empty object representation', () => {
        sinon.stub(fs, 'readFileSync').throws();
        expect(loadPackageJson()).to.eql('{}');
        fs.readFileSync.restore();
      });
    });
  });

  describe('escapeTeamCityString', () => {
    it('returns empty strings', () => {
      expect(escapeTeamCityString(null)).to.eql('');
    });

    it('replaces TeamCity special characters', () => {
      expect(escapeTeamCityString("'\n\r\u0085\u2028\u2029|[]")).to.eql("|'|n|r|x|l|p|||[|]");
    });
  });

  describe('getOutputMessage', () => {
    it('returns the TEST_SUITE_STARTED message', () => {
      expect(
        getOutputMessage(TeamCityMessages.TEST_SUITE_STARTED, { report: 'report-name' }),
      ).to.eql("##teamcity[testSuiteStarted name='report-name']");
    });
    it('returns the TEST_SUITE_FINISHED message', () => {
      expect(
        getOutputMessage(TeamCityMessages.TEST_SUITE_FINISHED, { report: 'report-name' }),
      ).to.eql("##teamcity[testSuiteFinished name='report-name']");
    });

    it('returns the TEST_STARTED message', () => {
      expect(
        getOutputMessage(TeamCityMessages.TEST_STARTED, { report: 'report-name', file: 'test.js' }),
      ).to.eql("##teamcity[testStarted name='report-name: test.js']");
    });
    it('returns the TEST_FINISHED message', () => {
      expect(
        getOutputMessage(TeamCityMessages.TEST_FINISHED, {
          report: 'report-name',
          file: 'test.js',
        }),
      ).to.eql("##teamcity[testFinished name='report-name: test.js']");
    });

    it('returns the TEST_FAILED message', () => {
      const errors = '';
      expect(
        getOutputMessage(TeamCityMessages.TEST_FAILED, {
          errors,
          report: 'report-name',
          file: 'test.js',
        }),
      ).to.eql(`##teamcity[testFailed name='report-name: test.js' message='${errors}']`);
    });
    it('returns the TEST_STD_OUT message', () => {
      const warnings = '';
      expect(
        getOutputMessage(TeamCityMessages.TEST_STD_OUT, {
          warnings,
          report: 'report-name',
          file: 'test.js',
        }),
      ).to.eql(`##teamcity[testStdOut name='report-name: test.js' out='warning: ${warnings}']`);
    });

    it('returns escaped values in errors', () => {
      const errors = '|[]\'';
      expect(
        getOutputMessage(TeamCityMessages.TEST_FAILED, {
          errors,
          report: '[report-name]',
          file: '[test.js]',
        }),
      ).to.eql(`##teamcity[testFailed name='|[report-name|]: |[test.js|]' message='${escapeTeamCityString(errors)}']`);
    });
    it('returns escaped values in warnings', () => {
      const warnings = '|[]\'';
      expect(
        getOutputMessage(TeamCityMessages.TEST_STD_OUT, {
          warnings,
          report: '[report-name]',
          file: '[test.js]',
        }),
      ).to.eql(`##teamcity[testStdOut name='|[report-name|]: |[test.js|]' out='warning: ${escapeTeamCityString(warnings)}']`);
    });

    it('returns the INSPECTION_TYPE message', () => {
      expect(
        getOutputMessage(TeamCityMessages.INSPECTION_TYPE, {
          reportName: 'report-name',
          ruleName: 'rule-name',
        }),
      ).to.eql(`##teamcity[inspectionType id='rule-name' category='report-name' name='rule-name' description='report-name']`);
    });
    it('returns the INSPECTION message', () => {
      const formattedMessage = '';
      expect(
        getOutputMessage(TeamCityMessages.INSPECTION, {
          formattedMessage,
          reportName: 'report-name',
          ruleName: 'rule-name',
          filePath: 'test.js',
          line: 1,
          severity: 'ERROR'
        }),
      ).to.eql(`##teamcity[inspection typeId='rule-name' message='${formattedMessage}' file='test.js' line='1' SEVERITY='ERROR']`);
    });

    it('returns escaped values in inspections', () => {
      const formattedMessage = '|[]\'';
      expect(
        getOutputMessage(TeamCityMessages.INSPECTION, {
          formattedMessage,
          reportName: '[report-name]',
          ruleName: '[rule-name]',
          filePath: '[test.js]',
          line: 1,
          severity: 'WARNING'
        }),
      ).to.eql(`##teamcity[inspection typeId='|[rule-name|]' message='${
        escapeTeamCityString(formattedMessage)
        }' file='|[test.js|]' line='1' SEVERITY='WARNING']`);
    });
  });
});
