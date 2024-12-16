import { computed, DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AltExecutionStateService } from './alt-execution-state.service';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ExecutionSummaryDto, PrivateViewPluginService, ReportNode, TableDataSource } from '@exense/step-core';
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
    private summaryView: string,
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
  private _destroyRef = inject(DestroyRef);
  private _viewService = inject(PrivateViewPluginService);
  private _executionStorage = inject(AltExecutionStorageService);
  private _executionState = inject(AltExecutionStateService);
  private _fb = inject(FormBuilder);
  private _viewAllService = inject(AltExecutionViewAllService);

  private get isIgnoreFilter(): boolean {
    return this._viewAllService.isViewAll;
  }

  private summaryInProgressInternal$ = new BehaviorSubject(false);

  readonly summaryInProgress$ = this.summaryInProgressInternal$.pipe(distinctUntilChanged());

  readonly listInProgress$: Observable<boolean>;

  readonly summary$ = this._executionState.execution$.pipe(
    map((execution) => execution?.id),
    filter((executionId) => !!executionId),
    tap(() => this.summaryInProgressInternal$.next(true)),
    switchMap((executionId) => this._viewService.getView(this.summaryView, executionId!)),
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

  readonly dateRange$ = this._executionState.dateRange$;

  readonly statuses = REPORT_NODE_STATUS;

  readonly statusesCtrl = this._fb.control<Status[]>([]);

  private statusCtrlValue = toSignal(this.statusesCtrl.valueChanges, { initialValue: this.statusesCtrl.value });

  readonly selectedStatuses$ = this.statusesCtrl.valueChanges.pipe(
    startWith(this.statusesCtrl.value),
    map((statuses) => new Set(statuses)),
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

  ngOnDestroy(): void {
    this.summaryInProgressInternal$.complete();
  }

  readonly isFilteredByNonPassedAndNoRunning = computed(() => {
    const statuses = new Set(this.statusCtrlValue());
    return statuses.size === this.statuses.length - 2 && !statuses.has(Status.PASSED) && !statuses.has(Status.RUNNING);
  });

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

  private setupSyncWithStorage(): void {
    const executionId$ = this._executionState.executionId$.pipe(distinctUntilChanged());
    const isIgnoreFilter$ = this._viewAllService.isViewAll$;
    combineLatest([executionId$, isIgnoreFilter$])
      .pipe(takeUntilDestroyed())
      .subscribe(([executionId, isIgnoreFilter]) => {
        this.restoreSearch(executionId, isIgnoreFilter);
        this.restoreStatues(executionId, isIgnoreFilter);
      });

    this.statusesCtrl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((statuses) => this.saveStatuses(statuses));

    this.searchCtrl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed(this._destroyRef))
      .subscribe((search) => this.saveSearch(search));
  }
}
