import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasePlanAction, DialogsService, Plan, PlanAction } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PlanDeleteConfirmAction extends BasePlanAction {
  private _dialogs = inject(DialogsService);

  readonly name = 'confirm';
  readonly action = PlanAction.DELETE;

  protected proceedAction(entity: Plan): Observable<boolean> {
    const name = entity.attributes?.['name'];
    return this._dialogs.showDeleteWarning(1, `Plan "${name}"`);
  }
}
