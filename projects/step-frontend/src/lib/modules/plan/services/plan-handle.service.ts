import { Observable } from 'rxjs';
import { AbstractArtefact } from '@exense/step-core';

export abstract class PlanHandleService {
  abstract hasUndo$: Observable<boolean>;
  abstract hasRedo$: Observable<boolean>;
  abstract selectedArtefact$: Observable<AbstractArtefact | undefined>;
  abstract isInteractiveSessionActive$: Observable<boolean>;
  abstract handlePlanChange(): void;
  abstract moveUp(node?: AbstractArtefact): void;
  abstract moveDown(node?: AbstractArtefact): void;
  abstract undo(): void;
  abstract redo(): void;
  abstract discardAll(): void;
  abstract delete(node?: AbstractArtefact): void;
  abstract copy(node?: AbstractArtefact): void;
  abstract paste(node?: AbstractArtefact): void;
  abstract rename(node?: AbstractArtefact): void;
  abstract toggleSkip(node?: AbstractArtefact): void;
  abstract openArtefact(node?: AbstractArtefact): void;
  abstract execute(): void;
}
