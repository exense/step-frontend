import { inject, Injectable } from '@angular/core';
import { AbstractArtefact } from '../../../client/generated';
import { IDE_MODE } from '../../basics/injectables/ide-mode.token';

export type PlanReferenceMode = 'ID' | 'SELECTION_CRITERIA';

@Injectable({
  providedIn: 'root',
})
export class PlanReferencePolicyService {
  private readonly _isIdeMode = inject(IDE_MODE);

  readonly planInsertionMode: PlanReferenceMode = this._isIdeMode ? 'SELECTION_CRITERIA' : 'ID';

  isDirectPlanReference(artefact?: AbstractArtefact): boolean {
    return artefact?._class === 'CallPlan' && !!(artefact as AbstractArtefact & { planId?: string }).planId;
  }

  canNavigateToReferencedPlan(artefact?: AbstractArtefact): boolean {
    return !(this._isIdeMode && this.isDirectPlanReference(artefact));
  }

  canChangeReferencedPlan(artefact?: AbstractArtefact): boolean {
    return this.canNavigateToReferencedPlan(artefact);
  }
}
