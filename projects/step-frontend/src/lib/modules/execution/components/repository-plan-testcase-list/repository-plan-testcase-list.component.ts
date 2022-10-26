import { Component, Input } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_MODULE,
  AutoDeselectStrategy,
  BulkOperationType,
  BulkOperationsInvokeService,
  ExecutiontTaskParameters,
  selectionCollectionProvider,
  ControllerService,
  Mutable,
  TestSetStatusOverview,
  TableLocalDataSource,
  TestRunStatus,
} from '@exense/step-core';
import { ScheduledTaskLogicService } from '../../../scheduler/services/scheduled-task-logic.service';
import { BehaviorSubject, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { ScheduledTaskBulkOperationsInvokeService } from '../../../scheduler/services/scheduled-task-bulk-operations-invoke.service';

type InProgress = Mutable<Pick<ScheduledTaskLogicService, 'inProgress'>>;

@Component({
  selector: 'repository-plan-testcase-list',
  templateUrl: './repository-plan-testcase-list.component.html',
  styleUrls: ['./repository-plan-testcase-list.component.scss'],
  providers: [
    selectionCollectionProvider<string, TestRunStatus>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: ScheduledTaskBulkOperationsInvokeService,
    },
  ],
})
export class RepositoryPlanTestcaseListComponent {
  @Input() planId: string = '';

  readonly inProgress: boolean = false;

  private repositoryReportRequest$ = new BehaviorSubject<any>({});
  readonly repositoryReport$ = this.repositoryReportRequest$.pipe(
    tap((_) => ((this as InProgress).inProgress = true)),
    switchMap((_) =>
      this._controllerService.getReport({
        repositoryID: 'local',
        repositoryParameters: { planid: '63591bf8f7811970af84bc86' },
      })
    ),
    map((testSetStatusOverview: TestSetStatusOverview) => testSetStatusOverview.runs!),
    tap((_) => ((this as InProgress).inProgress = false)),
    shareReplay(1)
  );

  constructor(public readonly _controllerService: ControllerService) {}

  loadTable(): void {
    this.repositoryReportRequest$.next({});
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepRepositoryPlanTestcaseList', downgradeComponent({ component: RepositoryPlanTestcaseListComponent }));
