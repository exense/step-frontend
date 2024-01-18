import { map, Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { AugmentedPlansService, BasePlanAction, Plan, PlanAction } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PlanDeleteAction extends BasePlanAction {
  private _api = inject(AugmentedPlansService);

  readonly name?: string = 'deleteInvoke';
  readonly action = PlanAction.DELETE;

  protected proceedAction(entity: Plan): Observable<boolean> {
    return this._api.deletePlan(entity.id!).pipe(map(() => true));
  }
}
