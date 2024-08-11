import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  DialogParentService,
  DialogsService,
  IsUsedByDialogService,
  Plan,
  selectionCollectionProvider,
  STORE_ALL,
  tableColumnsConfigProvider,
  tablePersistenceConfigProvider,
  ToastService,
  ToastType,
} from '@exense/step-core';
import { map, of, pipe, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'step-plan-list',
  templateUrl: './plan-list.component.html',
  styleUrls: ['./plan-list.component.scss'],
  providers: [
    tableColumnsConfigProvider({
      entityTableRemoteId: AugmentedPlansService.PLANS_TABLE_ID,
      entityScreenId: 'plan',
      entityScreenDefaultVisibleFields: ['attributes.name'],
    }),
    tablePersistenceConfigProvider('planList', STORE_ALL),
    ...selectionCollectionProvider<string, Plan>('id', AutoDeselectStrategy.DESELECT_ON_UNREGISTER),
    {
      provide: DialogParentService,
      useExisting: forwardRef(() => PlanListComponent),
    },
  ],
})
export class PlanListComponent implements DialogParentService {
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _dialogs = inject(DialogsService);
  private toast = inject(ToastService);
  private _router = inject(Router);
  readonly _plansApiService = inject(AugmentedPlansService);

  readonly dataSource = this._plansApiService.getPlansTableDataSource();

  private updateDataSourceAfterChange = pipe(
    tap((changeResult?: Plan | boolean | string[]) => {
      if (changeResult) {
        this.dataSource.reload();
      }
    }),
  );

  dialogSuccessfullyClosed(): void {
    this.dataSource.reload();
  }

  duplicatePlan(id: string): void {
    let clonedPlan: Plan;
    const values: Array<string> = [];
    this._plansApiService
      .clonePlan(id)
      .pipe(
        switchMap((clone) => {
          clonedPlan = clone;
          if (clonedPlan.root?.attributes!['name']) {
            values.push(clonedPlan.root?.attributes!['name']);
          }
          return this._plansApiService.savePlan(clone);
        }),
        this.updateDataSourceAfterChange,
      )
      .subscribe(() =>
        this.toast.showToast(
          ToastType.SUCCESS,
          `{0} successfully duplicated`,
          values,
          clonedPlan,
          'plans',
          [{ label: 'Edit', handler: () => this._router.navigateByUrl(`/plans/editor/${clonedPlan.id}`) }],
          false,
        ),
      );
  }

  deletePlan(plan: Plan): void {
    const name = plan.attributes?.['name'];
    this._dialogs
      .showDeleteWarning(1, `Plan "${name}"`)
      .pipe(
        switchMap((isDeleteConfirmed) =>
          isDeleteConfirmed ? this._plansApiService.deletePlan(plan.id!).pipe(map(() => true)) : of(false),
        ),
        this.updateDataSourceAfterChange,
      )
      .subscribe();
  }

  lookUp(id: string, name: string): void {
    this._isUsedByDialogs.displayDialog(`Plan "${name}" is used by`, 'PLAN_ID', id);
  }
}
