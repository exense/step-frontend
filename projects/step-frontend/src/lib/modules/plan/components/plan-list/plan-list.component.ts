import { AfterViewInit, Component, inject, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import {
  AJS_LOCATION,
  AJS_MODULE,
  AugmentedPlansService,
  AutoDeselectStrategy,
  BulkOperationsInvokeService,
  BulkOperationType,
  Plan,
  PlanDialogsService,
  RestoreDialogsService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { ILocationService } from 'angular';
import { PlansBulkOperationsInvokeService } from '../../injectables/plans-bulk-operations-invoke.service';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('planList', STORE_ALL),
    selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: BulkOperationsInvokeService,
      useClass: PlansBulkOperationsInvokeService,
    },
  ],
})
export class PlanListComponent implements AfterViewInit {
  readonly _plansApiService = inject(AugmentedPlansService);
  private _planDialogs = inject(PlanDialogsService);
  private _restoreDialogsService = inject(RestoreDialogsService);
  private _location = inject(AJS_LOCATION);

  readonly dataSource = this._plansApiService.getPlansTableDataSource();
  readonly availableBulkOperations = [
    { operation: BulkOperationType.delete, permission: 'plan-delete' },
    { operation: BulkOperationType.duplicate, permission: 'plan-write' },
  ];

  ngAfterViewInit(): void {
    const { createNew } = this._location.search();
    if (createNew !== undefined) {
      this._location.search('createNew', null);
      // Timeout to be sure, that navigation events has been completed
      // Otherwise location change might auto close the modal
      setTimeout(() => this.addPlan(), 500);
    }
  }

  addPlan(): void {
    this._planDialogs.createPlan().subscribe((plan) => {
      if (!plan) {
        return;
      }
      this.dataSource.reload();
    });
  }

  editPlan(id: string): void {
    this._location.path(`/root/plans/editor/${id}`);
  }

  executePlan(id: string): void {
    this._location.path(`/root/repository`).search({ repositoryId: 'local', planid: id });
  }

  duplicatePlan(id: string): void {
    this._planDialogs.duplicatePlan(id).subscribe(() => this.dataSource.reload());
  }

  deletePlan(id: string, name: string): void {
    this._planDialogs.deletePlan(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  importPlans(): void {
    this._planDialogs.importPlans().subscribe(() => this.dataSource.reload());
  }

  exportPlans(): void {
    this._planDialogs.exportPlans().subscribe(() => this.dataSource.reload());
  }

  exportPlan(id: string, name: string): void {
    this._planDialogs.exportPlan(id, name).subscribe();
  }

  lookUp(id: string, name: string): void {
    this._planDialogs.lookUp(id, name);
  }

  displayHistory(plan: Plan, permission: string): void {
    if (!plan.id) {
      return;
    }

    const id = plan.id!;
    const planVersion = plan.customFields ? plan.customFields['versionId'] : undefined;
    const versionHistory = this._plansApiService.getPlanVersions(id);

    this._restoreDialogsService
      .showRestoreDialog(planVersion, versionHistory, permission)
      .subscribe((restoreVersion) => {
        if (!restoreVersion) {
          return;
        }

        this._plansApiService.restorePlanVersion(id, restoreVersion).subscribe(() => this.dataSource.reload());
      });
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanList', downgradeComponent({ component: PlanListComponent }));
