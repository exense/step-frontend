import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  BulkSelectionType,
  ControllerService,
  SelectionCollector,
  RepositoryObjectReference,
  TestRunStatus,
  TableFetchLocalDataSource,
} from '@exense/step-core';
import { map, of, switchMap, tap, first, Observable } from 'rxjs';
import { Status } from '../../../_common/step-common.module';

const unique = <T>(item: T, index: number, self: T[]) => self.indexOf(item) === index;

@Component({
  selector: 'step-repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
})
export class RepositoryPlanTestcaseListComponent implements OnInit, OnChanges {
  @Input() repoRef?: RepositoryObjectReference;

  @Input() selectionType: BulkSelectionType = BulkSelectionType.NONE;
  @Output() selectionTypeChange = new EventEmitter<BulkSelectionType>();

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

  constructor(
    public readonly _controllerService: ControllerService,
    public readonly _selectionCollector: SelectionCollector<string, TestRunStatus>
  ) {}

  ngOnInit(): void {
    this.searchableRepositoryReport.allData$.pipe(first()).subscribe((items) => {
      this._selectionCollector.registerPossibleSelectionManually(items);
      this.selectionType = BulkSelectionType.ALL;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cRepoRef = changes['repoRef'];
    if (cRepoRef?.previousValue !== cRepoRef?.currentValue || cRepoRef?.firstChange) {
      this.searchableRepositoryReport.reload({ request: cRepoRef?.currentValue });
    }
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
