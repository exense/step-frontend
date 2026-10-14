import { Component, computed, effect, inject, input, OnInit, output, untracked, viewChild } from '@angular/core';
import {
  ArrayFilterComponent,
  BulkSelectionType,
  ControllerService,
  EntitySelectionState,
  entitySelectionStateProvider,
  IncludeTestcases,
  RepositoryObjectReference,
  SelectionList,
  TableFetchLocalDataSource,
  TableIndicatorMode,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TestRunStatus,
} from '@exense/step-core';
import { filter, Observable, of, startWith, switchMap, take, tap } from 'rxjs';
import { ERROR_STATUSES, Status } from '../../../_common/step-common.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { fetchRepositoryTestRuns } from '../../shared/relaunch-test-cases';

const unique = <T>(item: T, index: number, self: T[]): boolean => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [...entitySelectionStateProvider<string, TestRunStatus>('id')],
  standalone: false,
})
export class RepositoryPlanTestcaseListComponent implements OnInit {
  private _selectionState = inject<EntitySelectionState<string, TestRunStatus>>(EntitySelectionState);
  private readonly listSelect = viewChild('listSelect', { read: SelectionList<string, TestRunStatus> });

  private _controllerService = inject(ControllerService);

  readonly repoRef = input<RepositoryObjectReference | undefined>(undefined);
  readonly explicitTestCases = input<TestRunStatus[] | undefined>(undefined);

  readonly includedTestCasesChange = output<IncludeTestcases>();

  protected readonly dataSource = computed(() => {
    const testCases = this.explicitTestCases();
    if (testCases === undefined) {
      return this.createRepoRefDataSource();
    }
    untracked(() => {
      this.listSelect()?.clearSelection?.();
    });
    return this.createListDataSource(testCases);
  });

  private allData$ = toObservable(this.dataSource).pipe(switchMap((dataSource) => dataSource.allData$));
  private readonly allData = toSignal(this.allData$, { initialValue: [] });

  protected readonly statusItems = computed(() => {
    const testRunStatusList = this.allData();
    return testRunStatusList.map((testRunStatus) => testRunStatus.status as Status).filter(unique);
  });

  private allErrorStatusesSet = new Set(ERROR_STATUSES);

  private readonly errorStatuses = computed(() => {
    const statusItems = this.statusItems();
    return statusItems.filter((item) => this.allErrorStatusesSet.has(item));
  });

  protected readonly hasErrorStatuses = computed(() => this.errorStatuses().length > 0);

  private readonly statusFilter = viewChild('statusFilter', { read: ArrayFilterComponent });
  private statusFilter$ = toObservable(this.statusFilter);
  private statusFilterValue$ = this.statusFilter$.pipe(
    switchMap((statusFilter) => {
      if (!statusFilter) {
        return of([] as Status[]);
      }
      const ctrl = statusFilter.filterControl as FormControl<Status[]>;
      return ctrl.valueChanges.pipe(startWith(ctrl.value));
    }),
  );
  private readonly statusFilterValue = toSignal(this.statusFilterValue$, { initialValue: [] });

  protected readonly isErrorFilterApplied = computed(() => {
    const statusFilterValue = this.statusFilterValue() ?? [];
    const errorStatuses = this.errorStatuses() ?? [];
    const errorStatusesSet = new Set(errorStatuses);
    return (
      errorStatusesSet.size > 0 &&
      statusFilterValue.length === errorStatusesSet.size &&
      statusFilterValue.every((status) => errorStatusesSet.has(status))
    );
  });

  private readonly selectedItems = computed(() => {
    const allData = this.allData();
    const selected = this._selectionState.selectedKeys();
    return allData.filter((item) => this._selectionState.isSelected(item));
  });

  private effectEmitTestCases = effect(() => {
    const includedTestCases = this.includedTestCases();
    this.includedTestCasesChange.emit(includedTestCases);
  });

  private readonly includedTestCases = computed(() => {
    const repoRef = this.repoRef();
    const selectedItems = this.selectedItems();
    const allItems = this.allData();
    const selectionType = this._selectionState.selectionType();

    if (!allItems.length) {
      return { by: 'all', list: [] } as IncludeTestcases;
    }

    let by: IncludeTestcases['by'] = repoRef?.repositoryID === 'local' ? 'id' : 'name';
    by = selectionType === BulkSelectionType.ALL ? 'all' : by;

    const list = selectedItems.map((item) => (by === 'name' ? item.testplanName : item.id));
    return { by, list } as IncludeTestcases;
  });

  private effectReloadTable = effect(() => {
    const repoRef = this.repoRef();
    untracked(() => {
      const ds = this.dataSource();
      if (ds instanceof TableFetchLocalDataSource) {
        ds.reload({ request: repoRef });
      }
    });
  });

  ngOnInit(): void {
    this.allData$
      .pipe(
        filter((items) => !!items.length),
        take(1),
      )
      .subscribe((_) => this.listSelect()?.selectAll?.());
  }

  // eslint-disable-next-line step-lint/component-public-fields -- Used by the launch dialog to restore the relaunch selection.
  reselect(idsToSelect: string[]): void {
    this.listSelect()?.selectIds(idsToSelect);
  }

  protected toggleErrorFilter(): void {
    if (this.isErrorFilterApplied()) {
      this.statusFilter()?.filterControl?.setValue?.([]);
      return;
    }
    const errorStatuses = this.errorStatuses();
    this.statusFilter()?.filterControl?.setValue?.(errorStatuses);
  }

  private createListDataSource(items: TestRunStatus[]): TableLocalDataSource<TestRunStatus> {
    return new TableLocalDataSource(items, this.createDataSourceConfig());
  }

  private createRepoRefDataSource(): TableLocalDataSource<TestRunStatus> {
    return new TableFetchLocalDataSource<TestRunStatus, RepositoryObjectReference>(
      (request) => this.getTestRuns(request),
      this.createDataSourceConfig(),
    );
  }

  private createDataSourceConfig(): TableLocalDataSourceConfig<TestRunStatus> {
    return TableLocalDataSource.configBuilder<TestRunStatus>()
      .addSearchStringRegexPredicate('status', (item) => item.status)
      .addSortStringPredicate('status', (item) => item.status)
      .build();
  }

  private getTestRuns(repoRef?: RepositoryObjectReference): Observable<TestRunStatus[] | undefined> {
    return fetchRepositoryTestRuns(this._controllerService, repoRef).pipe(
      tap(() => this.listSelect()?.clearSelection?.()),
      catchError((err) => {
        // error is handled in interceptor but let's return an empty array to satisfy Angular lifecycle hook
        return of([]);
      }),
    );
  }

  protected readonly TableIndicatorMode = TableIndicatorMode;
}
