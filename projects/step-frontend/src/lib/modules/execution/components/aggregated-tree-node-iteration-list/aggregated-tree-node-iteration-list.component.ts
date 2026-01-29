import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';
import {
  AugmentedExecutionsService,
  DateUtilsService,
  FilterConditionFactoryService,
  ItemsPerPageService,
  SearchValue,
  TableRemoteDataSourceFactoryService,
  TableSearch,
  ReportNode,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableStorageService,
  TableMemoryStorageService,
  TableDataSource,
  AlertType,
  TableIndicatorMode,
} from '@exense/step-core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatSort, SortDirection } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { debounceTime, map, startWith, switchMap, Observable, of } from 'rxjs';
import { REPORT_NODE_STATUS, Status } from '../../../_common/shared/status.enum';

const PAGE_SIZE = 25;

@Component({
  selector: 'step-aggregated-tree-node-iteration-list',
  templateUrl: './aggregated-tree-node-iteration-list.component.html',
  styleUrl: './aggregated-tree-node-iteration-list.component.scss',
  providers: [
    {
      provide: ItemsPerPageService,
      useExisting: AggregatedTreeNodeIterationListComponent,
    },
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('aggregatedIterationList', STORE_ALL),
  ],
  standalone: false,
})
export class AggregatedTreeNodeIterationListComponent implements AfterViewInit, ItemsPerPageService {
  private _fb = inject(FormBuilder).nonNullable;
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private _renderer = inject(Renderer2);
  private _executionState = inject(AltExecutionStateService);
  private _filterConditionFactory = inject(FilterConditionFactoryService);
  private _dataSourceFactory = inject(TableRemoteDataSourceFactoryService);
  private _dateUtils = inject(DateUtilsService);

  readonly statuses = REPORT_NODE_STATUS;

  protected tableSearch = viewChild('table', { read: TableSearch });

  private matSort = viewChild(MatSort);

  protected sort = signal<SortDirection>('desc');

  private effectSort = effect(() => {
    const sort = this.sort();
    const mastSort = this.matSort();
    mastSort?.sort({ id: 'executionTime', start: sort, disableClear: true });
  });

  readonly node = input.required<AggregatedTreeNode>();
  readonly initialStatus = input<Status | undefined>(undefined);
  readonly initialStatusCount = input<number | undefined>(undefined);
  readonly resolvedPartialPath = input<string | undefined>(undefined);
  readonly showDetails = output<ReportNode>();

  readonly openTreeView = output<ReportNode>();

  private artefactHash = computed(() => this.node().artefactHash);

  protected readonly dataSource = computed(() => {
    const artefactHash = this.artefactHash();
    const resolvedPartialPath = this.resolvedPartialPath();
    return this.getReportNodeDataSource(artefactHash, resolvedPartialPath);
  });

  private dataSource$ = toObservable(this.dataSource);
  private totalItems$ = this.dataSource$.pipe(switchMap((dataSource) => dataSource.totalFiltered$));

  protected readonly totalItems = toSignal(this.totalItems$, { initialValue: 0 });

  protected readonly keywordParameters = toSignal(
    this._executionState.keywordParameters$.pipe(
      // omit test case selection in case of tree
      map((keywordParameters) => ({ ...keywordParameters, testcases: undefined })),
    ),
  );

  protected readonly searchCtrl = this._fb.control('');

  private searchCtrlValue = toSignal(this.searchCtrl.valueChanges, {
    initialValue: this.searchCtrl.value,
  });

  private searchSubscription = this.searchCtrl.valueChanges
    .pipe(
      startWith(this.searchCtrl.value),
      debounceTime(200),
      map((value) => (value ?? '').trim().toLowerCase()),
      takeUntilDestroyed(),
    )
    .subscribe((search) => untracked(() => this.tableSearch())?.onSearch?.('name', search));

  protected readonly statusesCtrl = this._fb.control<Status[]>([]);

  private effectSyncStatus = effect(() => {
    const initialStatus = this.initialStatus();
    this.statusesCtrl.setValue(initialStatus ? [initialStatus] : []);
  });

  private statusCtrlValue = toSignal(this.statusesCtrl.valueChanges, {
    initialValue: this.statusesCtrl.value,
  });
  private statusesSubscription = this.statusesCtrl.valueChanges
    .pipe(
      startWith(this.statusesCtrl.value),
      map((statuses) => Array.from(statuses)),
      takeUntilDestroyed(),
    )
    .subscribe((statuses) =>
      untracked(() => this.tableSearch())?.onSearch?.(
        'status',
        this._filterConditionFactory.inFilterCondition(statuses),
      ),
    );

  private timeRangeSubscription = this._executionState.timeRange$.pipe(takeUntilDestroyed()).subscribe((timeRange) => {
    const dateRange = this._dateUtils.timeRange2DateRange(timeRange);
    const filterCondition = this._filterConditionFactory.dateRangeFilterCondition(dateRange);
    const isForce = !!timeRange?.isManualChange;
    untracked(() => this.tableSearch())?.onSearch?.('executionTime', filterCondition, { isForce });
  });

  protected readonly showCountWarning = computed(() => {
    const initialStatus = this.initialStatus();
    const initialCount = this.initialStatusCount();
    const search = this.searchCtrlValue();
    const status = this.statusCtrlValue();
    const totalItems = this.totalItems();

    if (!!search || (!!initialStatus && (status?.length !== 1 || status[0] !== initialStatus)) || totalItems === 0) {
      return false;
    }
    return initialCount !== totalItems;
  });

  ngAfterViewInit(): void {
    const treeNodeName = this._el.nativeElement.closest<HTMLElement>('step-tree-node-name');
    if (treeNodeName) {
      this._renderer.addClass(treeNodeName, 'not-selectable');
    }
  }

  getItemsPerPage(): Observable<number[]> {
    return of([PAGE_SIZE]);
  }

  getDefaultPageSizeItem(): Observable<number> {
    return of(PAGE_SIZE);
  }

  protected openNodeDetails(node: ReportNode): void {
    this.showDetails.emit(node);
  }

  protected toggleSort(): void {
    this.sort.update((sort) => (sort === 'asc' ? 'desc' : 'asc'));
  }

  readonly isFilteredByNonPassed = computed(() => {
    const statuses = new Set(this.statusCtrlValue());
    return statuses.size === this.statuses.length - 1 && !statuses.has(Status.PASSED);
  });

  protected toggleFilterNonPassed(): void {
    const isFilteredByNonPassed = this.isFilteredByNonPassed();
    const statuses = !isFilteredByNonPassed ? this.statuses.filter((status) => status !== Status.PASSED) : [];
    this.statusesCtrl.setValue(statuses);
  }

  private getReportNodeDataSource(artefactHash?: string, resolvedPartialPath?: string): TableDataSource<ReportNode> {
    let filters: Record<string, string | string[] | SearchValue> | undefined = undefined;
    if (artefactHash) {
      filters = filters ?? {};
      filters['artefactHash'] = artefactHash;
    }
    if (resolvedPartialPath) {
      filters = filters ?? {};
      filters['path'] = { value: `^${resolvedPartialPath}`, regex: true };
    }
    return this._dataSourceFactory.createDataSource(
      AugmentedExecutionsService.REPORTS_TABLE_ID,
      {
        name: 'name',
        status: 'status',
        executionTime: 'executionTime',
      },
      filters,
    );
  }

  protected readonly AlertType = AlertType;
  protected readonly TableIndicatorMode = TableIndicatorMode;
}
