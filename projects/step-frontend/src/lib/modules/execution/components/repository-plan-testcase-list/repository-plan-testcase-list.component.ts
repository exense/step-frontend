import { Component, computed, effect, inject, input, model, OnInit, output, untracked } from '@angular/core';
import {
  AutoDeselectStrategy,
  BulkSelectionType,
  ControllerService,
  IncludeTestcases,
  RepositoryObjectReference,
  selectionCollectionProvider,
  SelectionCollector,
  TableFetchLocalDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TestRunStatus,
} from '@exense/step-core';
import { filter, map, Observable, of, switchMap, take, timer, catchError } from 'rxjs';
import { Status } from '../../../_common/step-common.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [...selectionCollectionProvider<string, TestRunStatus>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER)],
})
export class RepositoryPlanTestcaseListComponent implements OnInit {
  private _selectionCollector = inject<SelectionCollector<string, TestRunStatus>>(SelectionCollector);
  readonly selectionCollector = this._selectionCollector;

  private _controllerService = inject(ControllerService);

  readonly repoRef = input<RepositoryObjectReference | undefined>(undefined);
  readonly explicitTestCases = input<TestRunStatus[] | undefined>(undefined);

  private selected = toSignal(this._selectionCollector.selected$.pipe(map((selected) => new Set(selected))), {
    initialValue: new Set<string>(),
  });
  readonly selectionType = model(BulkSelectionType.NONE);

  readonly includedTestCasesChange = output<IncludeTestcases>();

  protected readonly dataSource = computed(() => {
    const testCases = this.explicitTestCases();
    if (testCases === undefined) {
      return this.createRepoRefDataSource();
    }
    return this.createListDataSource(testCases);
  });

  private dataSource$ = toObservable(this.dataSource);

  private allData$ = this.dataSource$.pipe(switchMap((dataSource) => dataSource.allData$));
  private allData = toSignal(this.allData$, { initialValue: [] });

  private allFiltered$ = this.dataSource$.pipe(switchMap((dataSource) => dataSource.allFiltered$));
  private allFiltered = toSignal(this.allFiltered$, { initialValue: [] });

  private effectFilterChange = effect(
    () => {
      const allFilters = this.allFiltered();
      this.selectionCollector.clear();
    },
    { allowSignalWrites: true },
  );

  protected statusItems = computed(() => {
    const testRunStatusList = this.allData();
    return testRunStatusList.map((testRunStatus) => testRunStatus.status as Status).filter(unique);
  });

  private selectedItems = computed(() => {
    const allData = this.allData();
    const selected = this.selected();
    return allData.filter((item) => selected.has(item.id!));
  });

  private effectEmitTestCases = effect(() => {
    const includedTestCases = this.includedTestCases();
    this.includedTestCasesChange.emit(includedTestCases);
  });

  readonly includedTestCases = computed(() => {
    const repoRef = this.repoRef();
    const selectedItems = this.selectedItems();
    const selectionType = this.selectionType();
    const allData = untracked(() => this.allData());
    const allFiltered = untracked(() => this.allFiltered());

    let by: IncludeTestcases['by'] = repoRef?.repositoryID === 'local' ? 'id' : 'name';
    by = selectionType === BulkSelectionType.ALL ? 'all' : by;

    let items: TestRunStatus[] = [];
    switch (selectionType) {
      case BulkSelectionType.ALL:
        items = allData;
        break;
      case BulkSelectionType.FILTERED:
        items = allFiltered;
        break;
      default:
        items = selectedItems;
        break;
    }

    const list = items.map((item) => (by === 'name' ? item.testplanName : item.id));
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
        switchMap(() => timer(500)),
      )
      .subscribe((ems) => {
        this.selectionType.set(BulkSelectionType.ALL);
      });
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

  private getTestRuns(repoRef?: RepositoryObjectReference): Observable<TestRunStatus[]> {
    return of(repoRef).pipe(
      switchMap((repoRef) => {
        if (!repoRef) {
          return of(undefined);
        }

        if (!repoRef?.repositoryParameters?.['planid']) {
          return this._controllerService.getReport(repoRef).pipe(
            map((value) => {
              if (value?.runs?.length! > 0) {
                value.runs!.forEach((run) => {
                  if (!run.id) {
                    run.id = run.testplanName;
                  }
                });
              }
              return value;
            }),
          );
        }
        return this._controllerService.getReport({
          repositoryID: 'local',
          repositoryParameters: { planid: repoRef?.repositoryParameters?.['planid'] },
        });
      }),
      map((testSetStatusOverview) => testSetStatusOverview?.runs || []),
      catchError((err) => {
        // error is handled in interceptor but let's return an empty array to satisfy Angular lifecycle hook
        return of([]);
      }),
    );
  }
}
