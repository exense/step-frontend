import { Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import {
  BulkSelectionType,
  ControllerService,
  RegistrationStrategy,
  RepositoryObjectReference,
  selectionCollectionProvider,
  SelectionCollector,
  TableFetchLocalDataSource,
  TestRunStatus,
} from '@exense/step-core';
import { BehaviorSubject, combineLatest, first, map, Observable, of, switchMap, tap } from 'rxjs';
import { Status } from '../../../_common/step-common.module';
import { IncludeTestcases } from '../../shared/include-testcases.interface';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [
    selectionCollectionProvider<string, TestRunStatus>({
      selectionKeyProperty: 'id',
      registrationStrategy: RegistrationStrategy.MANUAL,
    }),
  ],
})
export class RepositoryPlanTestcaseListComponent implements OnInit, OnChanges, OnDestroy {
  readonly _controllerService = inject(ControllerService);
  readonly _selectionCollector = inject<SelectionCollector<string, TestRunStatus>>(SelectionCollector);

  @Input() repoRef?: RepositoryObjectReference;

  readonly selectionType$ = new BehaviorSubject<BulkSelectionType>(BulkSelectionType.NONE);

  readonly searchableRepositoryReport = new TableFetchLocalDataSource<TestRunStatus, RepositoryObjectReference>(
    (request) => this.getTestRuns(request),
    TableFetchLocalDataSource.configBuilder<TestRunStatus>()
      .addSearchStringRegexPredicate('status', (item) => item.status)
      .addSortStringPredicate('status', (item) => item.status)
      .build()
  );

  readonly statusItems$ = this.searchableRepositoryReport.allData$.pipe(
    map((testRunStatusList) => testRunStatusList.map((testRunStatus) => testRunStatus.status as Status).filter(unique))
  );

  readonly includedTestcases$: Observable<IncludeTestcases> = combineLatest([
    this.selectionType$,
    this._selectionCollector.selected$,
  ]).pipe(
    map(([selectionType, ids]) => {
      const list = ids as string[];
      let by: IncludeTestcases['by'] = this.repoRef?.repositoryID === 'local' ? 'id' : 'name';
      by = selectionType === BulkSelectionType.ALL ? 'all' : by;
      return { by, list };
    })
  );

  ngOnInit(): void {
    this.searchableRepositoryReport.allData$.pipe(first()).subscribe((items) => {
      this._selectionCollector.registerPossibleSelectionManually(items);
      this.selectionType$.next(BulkSelectionType.ALL);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cRepoRef = changes['repoRef'];
    if (cRepoRef?.previousValue !== cRepoRef?.currentValue || cRepoRef?.firstChange) {
      this.searchableRepositoryReport.reload({ request: cRepoRef?.currentValue });
    }
  }

  ngOnDestroy(): void {
    this.selectionType$.complete();
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
            })
          );
        }
        return this._controllerService.getReport({
          repositoryID: 'local',
          repositoryParameters: { planid: repoRef?.repositoryParameters?.['planid'] },
        });
      }),
      map((testSetStatusOverview) => testSetStatusOverview?.runs || []),
      tap(() => this._selectionCollector.clear())
    );
  }
}
