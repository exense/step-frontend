import { Component, forwardRef, inject } from '@angular/core';
import {
  AugmentedPlansService,
  AutoDeselectStrategy,
  DialogParentService,
  DialogsService,
  Plan,
  IsUsedByDialogService,
  selectionCollectionProvider,
  STORE_ALL,
  tablePersistenceConfigProvider,
  tableColumnsConfigProvider,
  ExecutiontTaskParameters,
  ScheduledTaskTemporaryStorageService,
} from '@exense/step-core';
import { map, of, pipe, switchMap, tap } from 'rxjs';
import { SchedulerInvokerService } from '../../../execution/services/scheduler-invoker.service';
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
    {
      provide: SchedulerInvokerService,
      useExisting: forwardRef(() => PlanListComponent),
    },
  ],
  standalone: false,
})
export class PlanListComponent implements DialogParentService, SchedulerInvokerService {
  private _router = inject(Router);
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  private _isUsedByDialogs = inject(IsUsedByDialogService);
  private _dialogs = inject(DialogsService);

  readonly _plansApiService = inject(AugmentedPlansService);

  readonly dataSource = this._plansApiService.getPlansTableDataSource();

  readonly returnParentUrl = '/plans/list';

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
    this._plansApiService
      .clonePlan(id)
      .pipe(
        switchMap((clone) => this._plansApiService.savePlan(clone)),
        this.updateDataSourceAfterChange,
      )
      .subscribe();
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

  openScheduler(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate(['/', 'plans', 'list', 'schedule', temporaryId]);
  }
}
