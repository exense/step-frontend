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
  readonly dataSource = this._plansApiService.getPlansTableDataSource();

  constructor(
    readonly _plansApiService: AugmentedPlansService,
    private _planDialogs: PlanDialogsService,
    @Inject(AJS_LOCATION) private _location: ILocationService
  ) {}

  addPlan(): void {
    this._planDialogs.createPlan().subscribe(() => this.dataSource.reload());
  }

  editPlan(id: string): void {
    this._location.path(`/root/plans/editor/${id}`);
  }

  executePlan(id: string): void {
    this._location.path(`/root/repository`).search({ repositoryId: 'local', planid: id });
  }

  duplicatePlan(id: string): void {
    this._planDialogs.duplicatePlan(id).subscribe((_) => this.dataSource.reload());
  }

  deletePlan(id: string, name: string): void {
    this._planDialogs.deletePlan(id, name).subscribe((result) => {
      if (result) {
        this.dataSource.reload();
      }
    });
  }

  importPlans(): void {
    this._planDialogs.importPlans().subscribe((_) => this.dataSource.reload());
  }

  exportPlans(): void {
    this._planDialogs.exportPlans().subscribe((_) => this.dataSource.reload());
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
