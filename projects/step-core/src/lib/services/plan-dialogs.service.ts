import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { AugmentedPlansService, Plan } from '../client/step-client-module';
import { EntityDialogsService } from '../modules/entity/entity.module';

@Injectable({
  providedIn: 'root',
})
export class PlanDialogsService {
  private _plansApiService = inject(AugmentedPlansService);
  private _entityDialogs = inject(EntityDialogsService);

  selectPlan(tableFilter?: string): Observable<Plan> {
    const selectedEntity$ = this._entityDialogs.selectEntityOfType('plans', { tableFilter });
    const plan$ = selectedEntity$.pipe(
      map((result) => result.item as Plan),
      switchMap((plan) => this._plansApiService.getPlanById(plan.id!)),
    );
    return plan$;
  }
}
