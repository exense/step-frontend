import { Observable, of } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ARTEFACT_ID, EDITOR_URL } from '../types/constants';
import { BasePlanAction, Plan, PlanAction } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PlanEditAction extends BasePlanAction {
  private _router = inject(Router);

  readonly name = 'editInvoke';
  readonly action = PlanAction.EDIT;

  protected proceedAction(entity: Plan, additionalParams?: { artefactId?: string }): Observable<boolean> {
    const planEditLink = `${EDITOR_URL}/${entity.id}`;
    this.openPlanInternal(planEditLink, additionalParams?.artefactId);
    return of(true);
  }

  private openPlanInternal(planEditLink: string, artefactId?: string): void {
    const queryParams = artefactId ? { [ARTEFACT_ID]: artefactId } : undefined;
    const commands = planEditLink.split('/');
    this._router.navigate(commands, { queryParams });
  }
}
