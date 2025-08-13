import { Component, computed, effect, inject, input, model, OnInit, output, untracked } from '@angular/core';
import {
  BulkSelectionType,
  ControllerService,
  IncludeTestcases,
  RegistrationStrategy,
  RepositoryObjectReference,
  selectionCollectionProvider,
  SelectionCollector,
  TableFetchLocalDataSource,
  TableLocalDataSource,
  TableLocalDataSourceConfig,
  TestRunStatus,
} from '@exense/step-core';
import { filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Status } from '../../../_common/step-common.module';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [
    ...selectionCollectionProvider<string, TestRunStatus>({
      selectionKeyProperty: 'id',
      registrationStrategy: RegistrationStrategy.MANUAL,
    }),
  ],
  standalone: false,
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

  /** @Output **/
  readonly includedTestCasesChange = output<IncludeTestcases>();

  protected readonly dataSource = computed(() => {
    const testCases = this.explicitTestCases();
    if (testCases === undefined) {
      return this.createRepoRefDataSource();
    }
    untracked(() => {
      this._selectionCollector.clear();
      this._selectionCollector.registerPossibleSelectionManually(testCases);
    });
    return this.createListDataSource(testCases);
  });

  private allData$ = toObservable(this.dataSource).pipe(switchMap((dataSource) => dataSource.allData$));
  private allData = toSignal(this.allData$, { initialValue: [] });

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
      .subscribe((_) => this.selectionType.set(BulkSelectionType.ALL));
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
      tap(() => this._selectionCollector.clear()),
      tap((items) => this._selectionCollector.registerPossibleSelectionManually(items)),
      catchError((err) => {
        // error is handled in interceptor but let's return an empty array to satisfy Angular lifecycle hook
        return of([]);
      }),
    );
  }
}
