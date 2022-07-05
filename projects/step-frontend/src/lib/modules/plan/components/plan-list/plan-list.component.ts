import { Component, Inject } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_LOCATION, AJS_MODULE, AugmentedPlansService } from '@exense/step-core';
import { PlanDialogsService } from '../../services/plan-dialogs.service';
import { noop } from 'rxjs';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
})
export class PlanListComponent {
  constructor(
    readonly _plansApiService: AugmentedPlansService,
    private _planDialogs: PlanDialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addPlan(): void {
    this._planDialogs.createPlan().subscribe(() => this._plansApiService.reloadPlansTableDataSource());
  }

  editPlan(id: string): void {
    this._location.path(`/root/plans/editor/${id}`);
  }

  executePlan(id: string): void {
    this._location.path(`/root/repository`).search({ repositoryId: 'local', planid: id });
  }

  duplicatePlan(id: string): void {
    this._planDialogs.duplicatePlan(id).subscribe((_) => this._plansApiService.reloadPlansTableDataSource());
  }

  deletePlan(id: string, name: string): void {
    this._planDialogs.deletePlan(id, name).subscribe((result) => {
      if (result) {
        this._plansApiService.reloadPlansTableDataSource();
      }
    });
  }

  importPlans(): void {
    this._planDialogs.importPlans().subscribe((_) => this._plansApiService.reloadPlansTableDataSource());
  }

  exportPlans(): void {
    this._planDialogs.exportPlans().subscribe((_) => this._plansApiService.reloadPlansTableDataSource());
  }

  exportPlan(id: string, name: string): void {
    this._planDialogs.exportPlan(id, name).subscribe(noop);
  }

  lookUp(id: string, name: string): void {
    this._planDialogs.lookUp(id, name).subscribe(noop);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepPlanList', downgradeComponent({ component: PlanListComponent }));
