import { Formatter } from '../src/lib/Reporter';
import {expect} from 'chai';
import { Replacement } from 'tslint';
import * as ts from "typescript";
import { createFailure, getSourceFile } from './utils';

let reporter:Formatter;
let sourceFile1: ts.SourceFile;
let sourceFile2: ts.SourceFile;

describe('Reporter', () => {
  beforeEach(() => {
    sourceFile1 = getSourceFile('test1.ts');
    sourceFile2 = getSourceFile('test2.ts');
    reporter = new Formatter();
  });

  it('formats failures', () => {
    const maxPosition = sourceFile1.getFullWidth();

    const failures = [
      createFailure(sourceFile1, 0, 1, "first failure", "first-name", undefined, "error"),
      createFailure(
        sourceFile1,
        maxPosition - 1,
        maxPosition,
        "last failure",
        "last-name",
        undefined,
        "error",
      ),
      createFailure(
        sourceFile1,
        0,
        maxPosition,
        "full failure",
        "full-name",
        new Replacement(0, 0, ""),
        "warning",
      ),
      createFailure(
        sourceFile2,
        maxPosition - 1,
        maxPosition,
        "full failure",
        "full-name",
        new Replacement(0, 0, ""),
        "warning",
      ),
    ];

    const maxPositionObj1 = sourceFile1.getLineAndCharacterOfPosition(maxPosition - 1);
    const maxPositionObj2 = sourceFile2.getLineAndCharacterOfPosition(maxPosition - 1);


    const expectedResult:string = `
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
});
