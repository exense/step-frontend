import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ARTEFACT_ID, EDITOR_URL } from '../types/constants';
import { AuthService, BasePlanAction, MultipleProjectsService, Plan, PlanAction } from '@exense/step-core';

@Injectable({
  providedIn: 'root',
})
export class PlanEditCheckProjectAction extends BasePlanAction {
  private _multipleProjects = inject(MultipleProjectsService);
  private _auth = inject(AuthService);

  readonly name = 'checkProject';
  readonly action = PlanAction.EDIT;

  protected proceedAction(entity: Plan, additionalParams?: { artefactId?: string }): Observable<boolean> {
    if (
      this._auth.hasRight('admin-no-multitenancy') ||
      this._multipleProjects.isEntityBelongsToCurrentProject(entity)
    ) {
      return of(true);
    }

    const planEditLink = `${EDITOR_URL}/${entity.id}`;
    const artefactId = additionalParams?.artefactId;

    const editLinkParams = !artefactId
      ? planEditLink
      : {
          url: planEditLink,
          search: { [ARTEFACT_ID]: artefactId },
        };

    return this._multipleProjects.confirmEntityEditInASeparateProject(entity, editLinkParams, 'plan');
  }
}
