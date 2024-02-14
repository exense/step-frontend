import { Observable } from 'rxjs';
import { AbstractArtefact, Plan } from '../client/generated';

export abstract class PlanEditorStrategy {
  abstract hasRedo$: Observable<boolean>;
  abstract hasUndo$: Observable<boolean>;

  abstract readonly plan?: Plan;

  abstract readonly plan$: Observable<Plan | undefined>;

  abstract addControl(artefactTypeId: string): void;
  abstract addFunction(keywordId: string): void;
  abstract addPlan(planId: string): void;

  abstract undo(): void;

  abstract redo(): void;

  abstract discardAll(): void;

  abstract handlePlanChange(): void;
  abstract moveOut(node?: AbstractArtefact): void;
  abstract moveUp(node?: AbstractArtefact): void;
  abstract moveDown(node?: AbstractArtefact): void;
  abstract moveInNextSibling(node?: AbstractArtefact): void;
  abstract moveInPrevSibling(node?: AbstractArtefact): void;

  abstract delete(node?: AbstractArtefact): void;

  abstract copy(node?: AbstractArtefact): void;

  abstract paste(node?: AbstractArtefact): void;

  abstract pasteAfter(node?: AbstractArtefact): void;

  abstract duplicate(node?: AbstractArtefact): void;

  abstract rename(node?: AbstractArtefact): void;

  abstract toggleSkip(node?: AbstractArtefact, forceSkip?: boolean): void;

  //abstract initPlanUpdate(): void;

  abstract init(plan: Plan, selectedArtefactId?: string): void;
}
