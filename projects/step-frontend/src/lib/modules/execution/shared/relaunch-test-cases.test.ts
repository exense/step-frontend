import { ReportNode, TestRunStatus } from '@exense/step-core';
import { mergeRelaunchTestCases } from './relaunch-test-cases';

describe('mergeRelaunchTestCases', () => {
  const run = (id: string, testplanName: string): TestRunStatus => ({ id, testplanName, status: 'NORUN' });
  const node = (artefactID: string, name: string, status: ReportNode['status']): ReportNode =>
    ({ artefactID, name, status }) as ReportNode;

  it('keeps the repository test case list and applies the statuses of the relaunched execution', () => {
    const runs = [run('tc1', 'TC1'), run('tc2', 'TC2'), run('tc3', 'TC3'), run('tc4', 'TC4')];
    const nodes = [
      node('tc1', 'TC1', 'PASSED'),
      node('tc1', 'TC1', 'FAILED'),
      node('tc1', 'TC1', 'PASSED'),
      node('tc2', 'TC2', 'SKIPPED'),
      node('tc3', 'TC3', 'PASSED'),
      node('nested', 'Nested', 'PASSED'),
    ];

    const { items, selection } = mergeRelaunchTestCases(runs, nodes, true);

    expect(items).toEqual([
      { id: 'tc1', testplanName: 'TC1', status: 'FAILED' },
      { id: 'tc2', testplanName: 'TC2', status: 'SKIPPED' },
      { id: 'tc3', testplanName: 'TC3', status: 'PASSED' },
      { id: 'tc4', testplanName: 'TC4', status: 'NORUN' },
    ]);
    expect(selection).toEqual({ by: 'id', list: ['tc1', 'tc3'] });
  });

  it('matches non local repository test cases by name and selects all when every test case was executed', () => {
    const runs = [run('TC1', 'TC1'), run('TC2', 'TC2')];
    const nodes = [node('imported-1', 'TC1', 'PASSED'), node('imported-2', 'TC2', 'TECHNICAL_ERROR')];

    const { items, selection } = mergeRelaunchTestCases(runs, nodes, false);

    expect(items.map((item) => item.status)).toEqual(['PASSED', 'TECHNICAL_ERROR']);
    expect(selection).toBeUndefined();
  });
});
