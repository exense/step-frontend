import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { filter, map, of, shareReplay, switchMap, combineLatest, startWith, take } from 'rxjs';
import {
  AugmentedControllerService,
  AugmentedExecutionsService,
  DateRange,
  DateUtilsService,
  DEFAULT_RELATIVE_TIME_OPTIONS,
  Execution,
  ExecutiontTaskParameters,
  IS_SMALL_SCREEN,
  RELATIVE_TIME_OPTIONS,
  ScheduledTaskTemporaryStorageService,
  SystemService,
  TimeOption,
  TimeRange,
  TreeNodeUtilsService,
  TreeStateService,
} from '@exense/step-core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AltTestCasesNodesStateService } from '../../services/alt-test-cases-nodes-state.service';
import { AltKeywordNodesStateService } from '../../services/alt-keyword-nodes-state.service';
import { AltExecutionReportPrintService } from '../../services/alt-execution-report-print.service';
import { AltExecutionStorageService } from '../../services/alt-execution-storage.service';

const rangeKey = (executionId: string) => `${executionId}_range`;

@Component({
  selector: 'step-alt-execution-progress',
  templateUrl: './alt-execution-progress.component.html',
  styleUrl: './alt-execution-progress.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    AltExecutionTabsService,
    {
      provide: AltExecutionStateService,
      useExisting: AltExecutionProgressComponent,
    },
    {
      provide: RELATIVE_TIME_OPTIONS,
      useFactory: () => {
        const _state = inject(AltExecutionStateService);
        const _defaultOptions = inject(DEFAULT_RELATIVE_TIME_OPTIONS);

        return _state.executionFulLRange$.pipe(
          map((value) => ({ value, label: 'Full Range' }) as TimeOption),
          map((fullRangeOption) => [..._defaultOptions, fullRangeOption]),
        );
      },
    },
    AggregatedReportViewTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: AggregatedReportViewTreeNodeUtilsService,
    },
    AggregatedReportViewTreeStateService,
    {
      provide: TreeStateService,
      useExisting: AggregatedReportViewTreeStateService,
    },
    AltKeywordNodesStateService,
    AltTestCasesNodesStateService,
    AltExecutionReportPrintService,
  ],
})
export class AltExecutionProgressComponent implements OnInit, AltExecutionStateService {
  private _activeExecutions = inject(ActiveExecutionsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _controllerService = inject(AugmentedControllerService);
  private _systemService = inject(SystemService);
  private _fb = inject(FormBuilder);
  private _aggregatedTreeState = inject(AggregatedReportViewTreeStateService);
  private _dateUtils = inject(DateUtilsService);
  private _executionStorage = inject(AltExecutionStorageService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  private isTreeInitialized = false;

  private relativeTime?: number;

  get executionIdSnapshot(): string {
    const routeSnapshot = this._activatedRoute.snapshot;
    return routeSnapshot.params?.['id'] ?? '';
  }

  updateRelativeTime(time?: number) {
    this.relativeTime = time;
  }

  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  private dateRangeChangeSubscription = this.dateRangeCtrl.valueChanges
    .pipe(takeUntilDestroyed())
    .subscribe((range) => this.saveRangeToStorage(range));

  private dateRange$ = this.dateRangeCtrl.valueChanges.pipe(
    startWith(this.dateRangeCtrl.value),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly timeRange$ = this.dateRange$.pipe(
    map((dateRange) => {
      if (!dateRange) {
        return undefined;
      }
      const from = dateRange.start!.toMillis();
      const to = dateRange.end!.toMillis();
      if (from >= to) {
        return undefined;
      }
      return { from, to } as TimeRange;
    }),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  updateRange(timeRange: TimeRange | null | undefined) {
    if (!timeRange) {
      this.dateRangeCtrl.setValue(undefined);
      return;
    }
    const start = DateTime.fromMillis(timeRange.from);
    const end = DateTime.fromMillis(timeRange.to);
    this.dateRangeCtrl.setValue({ start, end });
  }

  selectFullRange(): void {
    this.execution$.pipe(take(1)).subscribe((execution) => {
      this.applyDefaultRange(execution);
    });
  }

  readonly executionId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  readonly activeExecution$ = this.executionId$.pipe(map((id) => this._activeExecutions.getActiveExecution(id)));

  readonly execution$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution?.execution$ ?? of(undefined)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly displayStatus$ = this.execution$.pipe(
    map((execution) => (execution?.status === 'ENDED' ? execution?.result : execution?.status)),
  );

  readonly executionFulLRange$ = this.execution$.pipe(map((execution) => this.getDefaultRangeForExecution(execution)));

  readonly isFullRangeSelected$ = combineLatest([this.dateRange$, this.executionFulLRange$]).pipe(
    map(([selectedRange, fullRange]) => {
      const startEq = this._dateUtils.areDatesEqual(selectedRange?.start, fullRange?.start);
      const endEq = this._dateUtils.areDatesEqual(selectedRange?.end, fullRange?.end);
      return startEq && endEq;
    }),
  );

  readonly isExecutionCompleted$ = this.execution$.pipe(map((execution) => execution.status === 'ENDED'));

  readonly testCases$ = this.execution$.pipe(
    switchMap((execution) =>
      this._executionsApi.getReportNodesByExecutionId(execution.id!, 'step.artefacts.reports.TestCaseReportNode', 500),
    ),
    map((testCases) => (!testCases?.length ? undefined : testCases)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly keywordParameters$ = combineLatest([this.execution$, this.testCases$]).pipe(
    map(([execution, testCases]) => {
      return {
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid: execution.id,
        testcases: !testCases?.length ? undefined : testCases.map((testCase) => testCase.artefactID!),
      } as KeywordParameters;
    }),
  );

  readonly keywords$ = this.keywordParameters$.pipe(
    switchMap((keywordParams) => this._controllerService.getReportNodes(keywordParams)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly currentOperations$ = this.execution$.pipe(
    map((execution) => {
      if (!execution || execution.status === 'ENDED') {
        return undefined;
      }
      return execution.id;
    }),
    switchMap((eId) => {
      if (!eId) {
        return of(undefined);
      }
      return this._systemService.getCurrentOperations(eId);
    }),
  );

  ngOnInit(): void {
    this.execution$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((execution) => {
      this.refreshExecutionTree(execution);
      this.applyDefaultRange(execution, true);
    });
  }

  private getDefaultRangeForExecution(execution: Execution, useStorage?: boolean): DateRange {
    let start: DateTime;
    let end: DateTime;

    if (execution.endTime) {
      const storedRange = useStorage ? this._executionStorage.getItem(rangeKey(execution.id!)) : undefined;
      if (storedRange) {
        const parsed = JSON.parse(storedRange) as { start?: number; end?: number };
        start = DateTime.fromMillis(parsed.start ?? execution.startTime!);
        end = DateTime.fromMillis(parsed.end ?? execution.endTime);
      } else {
        start = DateTime.fromMillis(execution.startTime!);
        end = DateTime.fromMillis(execution.endTime);
      }
    } else if (this.relativeTime) {
      end = DateTime.now();
      start = end.set({ millisecond: end.millisecond - this.relativeTime });
    } else {
      start = DateTime.fromMillis(execution.startTime!);
      end = DateTime.now();
    }

    return { start, end };
  }

  private saveRangeToStorage(range?: DateRange | null): void {
    const executionId = this.executionIdSnapshot;
    if (!range || !executionId) {
      return;
    }
    const start = range.start?.toMillis();
    const end = range.end?.toMillis();
    this._executionStorage.setItem(rangeKey(executionId), JSON.stringify({ start, end }));
  }

  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    const executionId = this._activatedRoute.snapshot.params['id'];
    this._activeExecutions.getActiveExecution(executionId)?.manualRefresh();
  }

  private applyDefaultRange(execution: Execution, useStorage = false): void {
    this.dateRangeCtrl.setValue(this.getDefaultRangeForExecution(execution, useStorage));
  }

  private refreshExecutionTree(execution: Execution): void {
    this._aggregatedTreeState
      .loadTree(execution.id!)
      .subscribe((isInitialized) => (this.isTreeInitialized = isInitialized));
  }
}
