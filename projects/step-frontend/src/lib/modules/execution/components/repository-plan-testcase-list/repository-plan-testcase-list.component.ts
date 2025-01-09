import { Component, computed, effect, forwardRef, inject, input, model, OnInit, output } from '@angular/core';
import {
  BulkSelectionType,
  ControllerService,
  IncludeTestcases,
  RegistrationStrategy,
  RepositoryObjectReference,
  selectionCollectionProvider,
  SelectionCollector,
  TableFetchLocalDataSource,
  TestRunStatus,
} from '@exense/step-core';
import { filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Status } from '../../../_common/step-common.module';
import { toSignal } from '@angular/core/rxjs-interop';

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
})
export class RepositoryPlanTestcaseListComponent implements OnInit {
  private _selectionCollector = inject<SelectionCollector<string, TestRunStatus>>(SelectionCollector);
  readonly selectionCollector = this._selectionCollector;

  private _controllerService = inject(ControllerService);

  /** @Input() **/
  readonly repoRef = input<RepositoryObjectReference | undefined>(undefined);

  private selected = toSignal(this._selectionCollector.selected$);
  readonly selectionType = model(BulkSelectionType.NONE);

  /** @Output **/
  readonly includedTestCasesChange = output<IncludeTestcases>();

  readonly dataSource = new TableFetchLocalDataSource<TestRunStatus, RepositoryObjectReference>(
    (request) => this.getTestRuns(request),
    TableFetchLocalDataSource.configBuilder<TestRunStatus>()
      .addSearchStringRegexPredicate('status', (item) => item.status)
      .addSortStringPredicate('status', (item) => item.status)
      .build(),
  );

  protected statusItems = toSignal(
    this.dataSource.allData$.pipe(
      map((testRunStatusList) =>
        testRunStatusList.map((testRunStatus) => testRunStatus.status as Status).filter(unique),
      ),
    ),
    { initialValue: [] },
  );

  private effectEmitTestCases = effect(() => {
    const includedTestCases = this.includedTestCases();
    this.includedTestCasesChange.emit(includedTestCases);
  });

  readonly includedTestCases = computed(() => {
    const repoRef = this.repoRef();
    const list = this.selected() as string[];
    const selectionType = this.selectionType();

    let by: IncludeTestcases['by'] = repoRef?.repositoryID === 'local' ? 'id' : 'name';
    by = selectionType === BulkSelectionType.ALL ? 'all' : by;
    return { by, list } as IncludeTestcases;
  });

  private effectReloadTable = effect(() => {
    const repoRef = this.repoRef();
    this.dataSource.reload({ request: repoRef });
  });

  ngOnInit(): void {
    this.dataSource.allData$
      .pipe(
        filter((items) => !!items.length),
        take(1),
      )
      .subscribe((_) => this.selectionType.set(BulkSelectionType.ALL));
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
    );
  }
}
