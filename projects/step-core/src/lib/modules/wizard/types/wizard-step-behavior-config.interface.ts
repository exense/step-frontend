import { Observable } from 'rxjs';

export interface WizardStepBehaviorConfig {
  disablePrevious$?: Observable<boolean>;
  disableNext$?: Observable<boolean>;
  canGoPrevious$?: Observable<boolean>;
  canGoNext$?: Observable<boolean>;
  onLeave?(): void;
  onEnter?(): void;
}
