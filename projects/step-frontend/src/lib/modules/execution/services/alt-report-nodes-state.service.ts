import { computed, DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AltExecutionStateService } from './alt-execution-state.service';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  Execution,
  FetchBucketsRequest,
  ReportNode,
  TableDataSource,
  TimeRange,
  TimeSeriesAPIResponse,
  TimeSeriesService,
} from '@exense/step-core';
import { ReportNodeSummary } from '../shared/report-node-summary';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AltExecutionStorageService } from './alt-execution-storage.service';
import { REPORT_NODE_STATUS, Status } from '../../_common/shared/status.enum';
import { AltExecutionViewAllService } from './alt-execution-view-all.service';
import { EXECUTION_ID } from './execution-id.token';

@Injectable()
export abstract class AltReportNodesStateService implements OnDestroy {
  protected constructor(
    readonly datasource$: Observable<TableDataSource<ReportNode>>,
    private storagePrefix: string,
  ) {
    this.listInProgress$ = datasource$.pipe(
      switchMap((dataSource) => dataSource.inProgress$),
      distinctUntilChanged(),
      takeUntilDestroyed(),
    );
    this.setupSyncWithStorage();
  }

  private _executionId = inject(EXECUTION_ID);
  protected _destroyRef = inject(DestroyRef);
  private _executionStorage = inject(AltExecutionStorageService);
  protected _executionState = inject(AltExecutionStateService);
  private _fb = inject(FormBuilder);
  private _viewAllService = inject(AltExecutionViewAllService);
  private _timeSeriesService = inject(TimeSeriesService);

  private get isIgnoreFilter(): boolean {
    return this._viewAllService.isViewAll;
  }

  protected summaryInProgressInternal$ = new BehaviorSubject(false);
  readonly summaryInProgress$ = this.summaryInProgressInternal$.asObservable();

  readonly listInProgress$: Observable<boolean>;

  readonly summary$ = combineLatest([
    this._executionState.execution$,
    this._executionState.timeRange$.pipe(filter((range) => !!range)),
  ]).pipe(
    map(([execution, timeRange]) => this.createFetchBucketRequest(execution, timeRange!)),
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((request) =>
      this._timeSeriesService.getReportNodesTimeSeries(request).pipe(
        catchError(() => of(undefined)),
        finalize(() => this.summaryInProgressInternal$.next(false)),
      ),
    ),
    map((response) => this.protectedTimeSeriesResponse(response)),
  );

  readonly dateRange$ = this._executionState.timeRange$;

  readonly statuses = REPORT_NODE_STATUS;

  readonly statusesCtrl = this._fb.nonNullable.control<Status[]>([]);

  readonly statusCtrlValue = toSignal(this.statusesCtrl.valueChanges, { initialValue: this.statusesCtrl.value });

  readonly selectedStatuses$ = this.statusesCtrl.valueChanges.pipe(
    startWith(this.statusesCtrl.value),
    map((statuses) => new Set(statuses)),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly reportNodeClassCtrl = this._fb.nonNullable.control<string | undefined>(undefined);
  readonly reportNodeClassValue = toSignal(this.reportNodeClassCtrl.valueChanges, {
    initialValue: this.reportNodeClassCtrl.value,
  });
  readonly reportNodeClass$ = this.reportNodeClassCtrl.valueChanges.pipe(
    startWith(this.reportNodeClassCtrl.value),
    shareReplay(1),
    takeUntilDestroyed(),
  );

  readonly searchCtrl = this._fb.control<string>('');

  readonly search$ = this.searchCtrl.valueChanges.pipe(
    startWith(this.searchCtrl.value),
    debounceTime(200),
    shareReplay(1),
    map((value) => (value ?? '').trim().toLowerCase()),
    takeUntilDestroyed(),
  );

  readonly isFilteredByNonPassedAndNoRunning = computed(() => {
    const statuses = new Set(this.statusCtrlValue());
    return statuses.size === this.statuses.length - 2 && !statuses.has(Status.PASSED) && !statuses.has(Status.RUNNING);
  });

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }

  updateStatusCtrl(statuses: Status[], reportNodeClass?: string): void {
    this.statusesCtrl.setValue(statuses);
    this.reportNodeClassCtrl.setValue(reportNodeClass);
  }

  toggleFilterNonPassedAndNoRunning(): void {
    const isFilteredByNonPassed = this.isFilteredByNonPassedAndNoRunning();
    const statuses = !isFilteredByNonPassed
      ? this.statuses.filter((status) => status !== Status.PASSED && status !== Status.RUNNING)
      : [];
    this.statusesCtrl.setValue(statuses);
  }

  getStatusText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const statuses = this.statusesCtrl.value ?? [];
    if (!statuses.length) {
      return '';
    }
    return `Statuses: ${statuses.join(', ')}`;
  }

  getSearchText(): string {
    if (this.isIgnoreFilter) {
      return '';
    }

    const searchText = (this.searchCtrl.value ?? '').trim();
    if (!searchText) {
      return '';
    }
    return `Search: ${searchText}`;
  }

  protected abstract createFetchBucketRequest(execution: Execution, timeRange: TimeRange): FetchBucketsRequest;

  protected protectedTimeSeriesResponse(response?: TimeSeriesAPIResponse): ReportNodeSummary {
    if (!response) {
      return { total: 0 } as ReportNodeSummary;
    }

    return response.matrixKeys.reduce(
      (res: ReportNodeSummary, keyAttributes, i) => {
        const bucket = response.matrix[i][0];
        const status = keyAttributes['status'] as string;
        res[status] = bucket.count;
        res.total += bucket.count;
        return res;
      },
      { total: 0 },
    ) as ReportNodeSummary;
  }

  private searchKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_search`;
  }

  private saveSearch(search?: string | null): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId && search) {
      this._executionStorage.setItem(this.searchKey(executionId), search);
    }
  }

  private restoreSearch(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.searchCtrl.setValue('');
      return;
    }
    const search = this._executionStorage.getItem(this.searchKey(executionId));
    this.searchCtrl.setValue(search ?? '');
  }

  private statusesKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_statuses`;
  }

  private saveStatuses(statuses?: Status[] | null): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId && statuses?.length) {
      const statusesString = statuses.join('|');
      this._executionStorage.setItem(this.statusesKey(executionId), statusesString);
    }
  }

  private restoreStatues(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.statusesCtrl.setValue([]);
      return;
    }
    const statusesString = this._executionStorage.getItem(this.statusesKey(executionId));
    const statuses = (statusesString?.split('|') ?? []) as Status[];
    this.statusesCtrl.setValue(statuses);
  }

  private reportNodeClassKey(executionId: string): string {
    return `${executionId}_${this.storagePrefix}_reportNodeClass`;
  }

  private saveReportNodeClass(reportNodeClass?: string): void {
    if (this.isIgnoreFilter) {
      return;
    }
    const executionId = this._executionId();
    if (executionId && reportNodeClass) {
      this._executionStorage.setItem(this.reportNodeClassKey(executionId), reportNodeClass);
    }
  }

  private restoreReportNodeClass(executionId: string, ignoreFilter?: boolean): void {
    if (!executionId) {
      return;
    }
    if (ignoreFilter) {
      this.reportNodeClassCtrl.setValue('');
      return;
    }
    const reportNodeClass = this._executionStorage.getItem(this.reportNodeClassKey(executionId));
    this.reportNodeClassCtrl.setValue(reportNodeClass ?? '');
  }

  private setupSyncWithStorage(): void {
    const executionId$ = this._executionState.executionId$.pipe(distinctUntilChanged());
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([executionId$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed())
      .subscribe(([executionId, isIgnoreFilter]) => {
        this.restoreSearch(executionId, isIgnoreFilter);
        this.restoreStatues(executionId, isIgnoreFilter);
        this.restoreReportNodeClass(executionId, isIgnoreFilter);
      });

    this.statusesCtrl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((statuses) => this.saveStatuses(statuses));

    this.reportNodeClassCtrl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((reportNodeClass) => this.saveReportNodeClass(reportNodeClass));

    this.searchCtrl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed(this._destroyRef))
      .subscribe((search) => this.saveSearch(search));
  }
}
