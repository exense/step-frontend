import { Component, inject } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  Plan,
  PlanDialogsService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
} from '@exense/step-core';
import { pipe, tap } from 'rxjs';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
  providers: [
    tablePersistenceConfigProvider('planList', STORE_ALL),
    ...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
  ],
})
export class PlanListComponent {
  private _planDialogs = inject(PlanDialogsService);
  readonly _plansApiService = inject(AugmentedPlansService);

  readonly dataSource = this._plansApiService.getPlansTableDataSource();

  private updateDataSourceAfterChange = pipe(
    tap((changeResult?: Plan | boolean | string[]) => {
      if (changeResult) {
        this.dataSource.reload();
      }
    })
  );

  addPlan(): void {
    this._planDialogs.createPlan().pipe(this.updateDataSourceAfterChange).subscribe();
  }

  editPlan(plan: Plan): void {
    this._planDialogs.editPlan(plan).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  executePlan(id: string): void {
    this._planDialogs.executePlan(id);
  }

  duplicatePlan(id: string): void {
    this._planDialogs.duplicatePlan(id).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  deletePlan(id: string, name: string): void {
    this._planDialogs.deletePlan(id, name).pipe(this.updateDataSourceAfterChange).subscribe();
  }

  importPlans(): void {
    this._planDialogs
      .importPlans()
      .pipe(this.updateDataSourceAfterChange)
      .subscribe((result) => {
        if (result) {
          this.dataSource.reload();
        }
      });
  }

  exportPlans(): void {
    this._planDialogs.exportPlans().pipe(this.updateDataSourceAfterChange).subscribe();
  }

  exportPlan(id: string, name: string): void {
    this._planDialogs.exportPlan(id, name).subscribe();
  }

  lookUp(id: string, name: string): void {
    this._planDialogs.lookUp(id, name);
  }
}
