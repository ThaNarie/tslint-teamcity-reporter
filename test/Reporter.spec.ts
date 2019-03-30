import { Formatter } from '../src/lib/Reporter';
import { expect } from 'chai';
import { Replacement, RuleFailure } from 'tslint';
import * as ts from "typescript";
import { createFailure, getSourceFile } from './utils';

let reporter: Formatter;
let sourceFile1: ts.SourceFile;
let sourceFile2: ts.SourceFile;
let failures: Array<RuleFailure>;
let maxPositionObj1: ts.LineAndCharacter;
let maxPositionObj2: ts.LineAndCharacter;

describe('Reporter', () => {
  beforeEach(() => {
    sourceFile1 = getSourceFile('test1.ts');
    sourceFile2 = getSourceFile('test2.ts');
    reporter = new Formatter();

    const maxPositionFile1 = sourceFile1.getFullWidth();
    const maxPositionFile2 = sourceFile2.getFullWidth();
    maxPositionObj1 = sourceFile1.getLineAndCharacterOfPosition(maxPositionFile1 - 1);
    maxPositionObj2 = sourceFile2.getLineAndCharacterOfPosition(maxPositionFile2 - 1);
    failures = [
      createFailure(sourceFile1, 0, 1, "first failure", "first-name", undefined, "error"),
      createFailure(
        sourceFile1,
        maxPositionFile1 - 1,
        maxPositionFile1,
        "last failure",
        "last-name",
        undefined,
        "error",
      ),
      createFailure(
        sourceFile1,
        0,
        maxPositionFile1,
        "full failure",
        "full-name",
        new Replacement(0, 0, ""),
        "warning",
      ),
      createFailure(
        sourceFile2,
        maxPositionFile2 - 1,
        maxPositionFile2,
        "full failure",
        "full-name",
        new Replacement(0, 0, ""),
        "warning",
      ),
    ];
  });

  it('formats failures as tests', () => {
    const expectedResult: string = `
##teamcity[testSuiteStarted name='TSLint Violations']
##teamcity[testStarted name='TSLint Violations: test1.ts']
##teamcity[testFailed name='TSLint Violations: test1.ts' message='line 0, col 0, first failure (first-name)|nline ${maxPositionObj1.line}, col ${maxPositionObj1.character}, last failure (last-name)']
##teamcity[testStdOut name='TSLint Violations: test1.ts' out='warning: line 0, col 0, full failure (full-name)']
##teamcity[testFinished name='TSLint Violations: test1.ts']
##teamcity[testStarted name='TSLint Violations: test2.ts']
##teamcity[testStdOut name='TSLint Violations: test2.ts' out='warning: line ${maxPositionObj2.line}, col ${maxPositionObj2.character}, full failure (full-name)']
##teamcity[testFinished name='TSLint Violations: test2.ts']
##teamcity[testSuiteFinished name='TSLint Violations']
##teamcity[buildStatisticValue key='TSLint Error Count' value='2']
##teamcity[buildStatisticValue key='TSLint Warning Count' value='2']`.slice(1); // strip leading newline

    const actualResult = reporter.format(failures);
    expect(actualResult).to.eql(expectedResult);
  });

  it('formats failures as inspections', () => {
    const expectedResult: string = `
##teamcity[inspectionType id='first-name' category='TSLint Violations' name='first-name' description='TSLint Violations']
##teamcity[inspection typeId='first-name' message='line 1, col 1, first failure' file='test1.ts' line='1' SEVERITY='ERROR']
##teamcity[inspectionType id='last-name' category='TSLint Violations' name='last-name' description='TSLint Violations']
##teamcity[inspection typeId='last-name' message='line 13, col 2, last failure' file='test1.ts' line='13' SEVERITY='ERROR']
##teamcity[inspectionType id='full-name' category='TSLint Violations' name='full-name' description='TSLint Violations']
##teamcity[inspection typeId='full-name' message='line 1, col 1, full failure' file='test1.ts' line='1' SEVERITY='WARNING']
##teamcity[inspection typeId='full-name' message='line 9, col 2, full failure' file='test2.ts' line='9' SEVERITY='WARNING']
##teamcity[buildStatisticValue key='TSLint Error Count' value='2']
##teamcity[buildStatisticValue key='TSLint Warning Count' value='2']`.slice(1); // strip leading newline

    const actualResult = reporter.format(failures, { reporter: 'inspections' });
    expect(actualResult).to.eql(expectedResult);
  });
});
