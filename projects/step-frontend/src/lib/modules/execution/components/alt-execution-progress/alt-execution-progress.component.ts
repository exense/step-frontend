import { Component, DestroyRef, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveExecutionsService } from '../../services/active-executions.service';
import { filter, map, of, shareReplay, switchMap, combineLatest } from 'rxjs';
import {
  AugmentedControllerService,
  AugmentedExecutionsService,
  DateRange,
  DEFAULT_RELATIVE_TIME_OPTIONS,
  Execution,
  ExecutiontTaskParameters,
  RELATIVE_TIME_OPTIONS,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
  Tab,
  TimeOption,
  TreeNodeUtilsService,
  TreeStateService,
} from '@exense/step-core';
import {
  EXECUTION_TREE_PAGING_SETTINGS,
  ExecutionTreePagingService,
} from '../../services/execution-tree-paging.service';
import { ReportTreeNodeUtilsService } from '../../services/report-tree-node-utils.service';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { FormBuilder } from '@angular/forms';
import { DateTime } from 'luxon';
import { AltExecutionDefaultRangeService } from '../../services/alt-execution-default-range.service';

@Component({
  selector: 'step-alt-execution-progress',
  templateUrl: './alt-execution-progress.component.html',
  styleUrl: './alt-execution-progress.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: AltExecutionStateService,
      useExisting: AltExecutionProgressComponent,
    },
    {
      provide: AltExecutionDefaultRangeService,
      useExisting: AltExecutionProgressComponent,
    },
    {
      provide: RELATIVE_TIME_OPTIONS,
      useFactory: () => {
        const _state = inject(AltExecutionStateService);
        const _defaultOptions = inject(DEFAULT_RELATIVE_TIME_OPTIONS);
        const _executionDefaultRange = inject(AltExecutionDefaultRangeService);

        return _state.execution$.pipe(
          map((execution) => _executionDefaultRange.getDefaultRangeForExecution(execution)),
          map((value) => ({ value, label: 'Full Range' }) as TimeOption),
          map((fullRangeOption) => [..._defaultOptions, fullRangeOption]),
        );
      },
    },
    {
      provide: EXECUTION_TREE_PAGING_SETTINGS,
      useValue: {},
    },
    ReportTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: ReportTreeNodeUtilsService,
    },
    ExecutionTreePagingService,
    TreeStateService,
  ],
})
export class AltExecutionProgressComponent
  implements OnInit, AltExecutionStateService, AltExecutionDefaultRangeService
{
  private _activeExecutions = inject(ActiveExecutionsService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroyRef = inject(DestroyRef);
  private _treeUtils = inject(ReportTreeNodeUtilsService);
  private _executionTreeState = inject<TreeStateService<ReportNode, ReportTreeNode>>(TreeStateService);
  private _executionsApi = inject(AugmentedExecutionsService);
  private _router = inject(Router);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _controllerService = inject(AugmentedControllerService);
  private _fb = inject(FormBuilder);

  private isTreeInitialized = false;

  protected relativeTime?: number;

  readonly dateRangeCtrl = this._fb.control<DateRange | null | undefined>(null);

  readonly executionId$ = this._activatedRoute.params.pipe(
    map((params) => params?.['id'] as string),
    filter((id) => !!id),
  );

  readonly activeExecution$ = this.executionId$.pipe(map((id) => this._activeExecutions.getActiveExecution(id)));

  readonly execution$ = this.activeExecution$.pipe(
    switchMap((activeExecution) => activeExecution?.execution$ ?? of(undefined)),
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

  readonly tabs: Tab<string>[] = [
    {
      id: 'report',
      label: 'Report',
      link: 'report',
    },
    {
      id: 'tree',
      label: 'Tree',
      link: 'tree',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      link: 'analytics',
    },
  ];

  ngOnInit(): void {
    this.execution$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((execution) => {
      this.refreshExecutionTree(execution);
      this.applyDefaultRange(execution);
    });
  }

  getDefaultRangeForExecution(execution: Execution): DateRange {
    let start: DateTime;
    let end: DateTime;

    if (execution.endTime) {
      start = DateTime.fromMillis(execution.startTime!);
      end = DateTime.fromMillis(execution.endTime);
    } else if (this.relativeTime) {
      end = DateTime.now();
      start = end.set({ millisecond: end.millisecond - this.relativeTime });
    } else {
      start = DateTime.fromMillis(execution.startTime!);
      end = DateTime.now();
    }

    return { start, end };
  }

  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], { relativeTo: this._activatedRoute });
  }

  manualRefresh(): void {
    const executionId = this._activatedRoute.snapshot.params['id'];
    this._activeExecutions.getActiveExecution(executionId)?.manualRefresh();
  }

  private applyDefaultRange(execution: Execution): void {
    this.dateRangeCtrl.setValue(this.getDefaultRangeForExecution(execution));
  }

  private refreshExecutionTree(execution: Execution): void {
    const isForceRefresh = execution.status === 'ENDED';

    const expandedNodeIds = this._executionTreeState.getExpandedNodeIds();
    this._treeUtils
      .loadNodes(execution.id!)
      .pipe(
        map((nodes) => nodes[0]),
        switchMap((rootNode) => {
          if (!rootNode || !this.isTreeInitialized || isForceRefresh) {
            return of(rootNode);
          }
          return this._treeUtils.restoreTree(rootNode, expandedNodeIds);
        }),
        filter((rootNode) => !!rootNode),
      )
      .subscribe((rootNode) => {
        this._executionTreeState.init(rootNode, { expandAllByDefault: false });
        this.isTreeInitialized = true;
      });
  }
}
