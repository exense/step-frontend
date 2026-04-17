import { inject, Injectable, OnDestroy } from '@angular/core';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { AugmentedControllerService, ReportNode, TableDataSource } from '@exense/step-core';
import { AltExecutionStateService } from './alt-execution-state.service';
import { BehaviorSubject, combineLatest, filter, map, Observable, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeywordParameters } from '../shared/keyword-parameters';

@Injectable()
export class AltTestCasesDetailsNodesStateService extends AltReportNodesStateService<ReportNode> implements OnDestroy {
  private readonly testCaseId$ = new BehaviorSubject<string | undefined>(undefined);

  constructor() {
    super(of(inject(AugmentedControllerService).createDataSource() as TableDataSource<ReportNode>), 'testCasesDetails');
    const _executionState = inject(AltExecutionStateService);
    this.tableParams$ = combineLatest(_executionState.keywordParameters$, this.testCaseId$).pipe(
      filter(([, testCaseId]) => !!testCaseId),
      map(([parameters, testCaseId]) => {
        if (!testCaseId) {
          return parameters;
        }
        return { ...parameters, testcases: [testCaseId] };
      }),
      takeUntilDestroyed(),
    );
  }

  readonly tableParams$: Observable<KeywordParameters>;

  ngOnDestroy(): void {
    this.testCaseId$.complete();
  }

  setTestCaseId(testCaseId?: string): void {
    this.testCaseId$.next(testCaseId);
  }
}
