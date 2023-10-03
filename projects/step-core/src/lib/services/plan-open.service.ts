import { inject, Injectable } from '@angular/core';
import { AJS_LOCATION } from '../shared';

interface PlanOpenState {
  readonly artefactId?: string;
  readonly startInteractive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlanOpenService {
  private lastOpenState?: PlanOpenState;
  private _$location = inject(AJS_LOCATION);

  getLastPlanOpenState(): PlanOpenState | undefined {
    const result = this.lastOpenState;
    this.lastOpenState = undefined;
    return result;
  }

  open(planId: string, planOpenState?: PlanOpenState): void {
    this.lastOpenState = planOpenState;
    this._$location.path(`/root/plans/editor/${planId}`);
  }
}
