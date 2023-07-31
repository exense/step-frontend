import { Observable } from 'rxjs';

export abstract class WizardStepBehaviorService {
  abstract disablePrevious$?: Observable<boolean>;
  abstract disableNext$?: Observable<boolean>;
  abstract canGoPrevious$?: Observable<boolean>;
  abstract canGoNext$?: Observable<boolean>;
  abstract onLeave?(): void;
  abstract onEnter?(): void;
}
