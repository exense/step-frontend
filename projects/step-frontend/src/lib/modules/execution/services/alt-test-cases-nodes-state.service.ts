import { inject, Injectable, OnDestroy } from '@angular/core';
import { AltReportNodesStateService } from './alt-report-nodes-state.service';
import { AltExecutionStateService } from './alt-execution-state.service';
import { ExecutionSummaryDto, PrivateViewPluginService } from '@exense/step-core';
import { BehaviorSubject, distinctUntilChanged, filter, map, shareReplay, switchMap, tap } from 'rxjs';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const SUMMARY_VIEW = 'statusDistributionForTestcases';

@Injectable()
export class AltTestCasesNodesStateService extends AltReportNodesStateService implements OnDestroy {
  constructor(_executionState: AltExecutionStateService) {
    super(_executionState.testCasesDataSource$, 'testCases');
  }

  private _viewService = inject(PrivateViewPluginService);

  private summaryInProgressInternal$ = new BehaviorSubject(false);
  override readonly summaryInProgress$ = this.summaryInProgressInternal$.pipe(distinctUntilChanged());

  override readonly summary$ = this._executionState.execution$.pipe(
    map((execution) => execution?.id),
    filter((executionId) => !!executionId),
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((executionId) => this._viewService.getView(SUMMARY_VIEW, executionId!)),
    map((view) => (view as ExecutionSummaryDto).distribution),
    map((distribution) =>
      Object.values(distribution).reduce(
        (res, value) => {
          if (value.count > 0) {
            res[value.status] = value.count;
            res.total += value.count;
          }
          return res;
        },
        { total: 0 } as ReportNodeSummary,
      ),
    ),
    tap(() => this.summaryInProgressInternal$.next(false)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }
}
