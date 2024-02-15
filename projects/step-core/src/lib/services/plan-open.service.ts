import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface PlanOpenState {
  readonly artefactId?: string;
  readonly startInteractive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PlanOpenService {
  private lastOpenState?: PlanOpenState;
  private _router = inject(Router);

  getLastPlanOpenState(): PlanOpenState | undefined {
    const result = this.lastOpenState;
    this.lastOpenState = undefined;
    return result;
  }

  open(planId: string, planOpenState?: PlanOpenState): void {
    this.lastOpenState = planOpenState;
    this._router.navigateByUrl(`/plans/editor/${planId}`);
  }
}
