import {
  chooseStatusWithMostPriority,
  ControllerService,
  IncludeTestcases,
  ReportNode,
  RepositoryObjectReference,
  TestRunStatus,
} from '@exense/step-core';
import { map, Observable, of } from 'rxjs';

export interface RelaunchTestCases {
  items: TestRunStatus[];
  selection?: IncludeTestcases;
}

type Status = NonNullable<TestRunStatus['status']>;

const NOT_EXECUTED_STATUSES = new Set<string>(['SKIPPED', 'NORUN']);

export const fetchRepositoryTestRuns = (
  controllerService: ControllerService,
  repoRef?: RepositoryObjectReference,
): Observable<TestRunStatus[] | undefined> => {
  if (!repoRef) {
    return of(undefined);
  }

  const planId = repoRef.repositoryParameters?.['planid'];
  if (planId) {
    return controllerService
      .getReport({ repositoryID: 'local', repositoryParameters: { planid: planId } })
      .pipe(map((overview) => overview?.runs));
  }

  return controllerService.getReport(repoRef).pipe(
    map((overview) => {
      overview?.runs?.forEach((run) => {
        if (!run.id) {
          run.id = run.testplanName;
        }
      });
      return overview?.runs;
    }),
  );
};

// Report nodes without a matching repository test case (e.g. nested test cases) are ignored
export const mergeRelaunchTestCases = (
  runs: TestRunStatus[],
  testCaseNodes: ReportNode[],
  isLocal: boolean,
): RelaunchTestCases => {
  const statusByKey = new Map<string, Status>();
  testCaseNodes.forEach((node) => {
    const key = isLocal ? node.artefactID : node.name;
    if (!key || !node.status) {
      return;
    }
    const previous = statusByKey.get(key);
    const status = previous ? chooseStatusWithMostPriority<Status>(previous, node.status)! : node.status;
    statusByKey.set(key, status);
  });

  const items = runs.map((run) => {
    const key = isLocal ? run.id : run.testplanName;
    const status = (key ? statusByKey.get(key) : undefined) ?? 'NORUN';
    return { ...run, status } as TestRunStatus;
  });

  const list = items.filter((item) => !NOT_EXECUTED_STATUSES.has(item.status!)).map((item) => item.id!);

  const selection: IncludeTestcases | undefined =
    !list.length || list.length === items.length ? undefined : { by: 'id', list };

  return { items, selection };
};
