import { Component, forwardRef, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  BulkOperationsInvokeService,
  ControllerService,
  Mutable,
  TestSetStatusOverview,
  TestRunStatus,
  SelectionCollector,
  SelectionCollectorContainer,
  BulkSelectionType,
  TableLocalDataSource,
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../../scheduler/services/scheduled-task-logic.service';
import { BehaviorSubject, map, of, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { ScheduledTaskBulkOperationsInvokeService } from '../../../scheduler/services/scheduled-task-bulk-operations-invoke.service';
import { REPORT_NODE_STATUS } from '../../../_common/shared/status.enum';

type InProgress = Mutable<Pick<ScheduledTaskLogicService, 'inProgress'>>;

@Component({
  selector: 'repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [
    {
      provide: SelectionCollectorContainer,
      useExisting: forwardRef(() => RepositoryPlanTestcaseListComponent),
    },
    {
      provide: SelectionCollector,
      useFactory: (container: SelectionCollectorContainer<string, TestRunStatus>) => container.selectionCollector,
      deps: [SelectionCollectorContainer],
    },
    {
      provide: BulkOperationsInvokeService,
      useClass: ScheduledTaskBulkOperationsInvokeService,
    },
  ],
})
export class RepositoryPlanTestcaseListComponent implements SelectionCollectorContainer<string, TestRunStatus> {
  @Input() planId: any;
  @Input() selectionCollector!: SelectionCollector<string, TestRunStatus>;

  readonly bulkSelectionTypeAll = BulkSelectionType.All;
  readonly inProgress: boolean = false;

  statusItems$: Observable<any> = of(REPORT_NODE_STATUS);

  private repositoryReportRequest$ = new BehaviorSubject<TestRunStatus>({});
  private repositoryReport$ = this.repositoryReportRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) =>
      this._controllerService.getReport({
        repositoryID: 'local',
        repositoryParameters: { planid: this.planId },
      })
    ),
    map((testSetStatusOverview: TestSetStatusOverview) => testSetStatusOverview.runs!),
    tap(
      (testRunStatusList: Array<TestRunStatus>) =>
        (this.statusItems$ = of(
          testRunStatusList
            .map((testRunStatus) => testRunStatus.status)
            .filter((value, index, self) => self.indexOf(value) === index)
        ))
    ),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  readonly searchableRepositoryReport$ = new TableLocalDataSource(this.repositoryReport$, {
    searchPredicates: {
      status: (element, searchValue) => {
        return searchValue.toLowerCase().includes(element!.status!.toLowerCase());
      },
    },
  });

  constructor(public readonly _controllerService: ControllerService) {}

  loadTable(): void {
    this.repositoryReportRequest$.next({});
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepRepositoryPlanTestcaseList', downgradeComponent({ component: RepositoryPlanTestcaseListComponent }));
