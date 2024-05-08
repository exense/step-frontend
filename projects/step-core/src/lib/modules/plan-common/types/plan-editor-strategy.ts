import { Observable } from 'rxjs';
import { AbstractArtefact } from '../../../client/step-client-module';
import { PlanContext } from './plan-context.interface';

export abstract class PlanEditorStrategy {
  abstract hasRedo$: Observable<boolean>;
  abstract hasUndo$: Observable<boolean>;

  abstract readonly planContext?: PlanContext;
  abstract readonly planContext$: Observable<PlanContext | undefined>;

  abstract addControl(artefactTypeId: string): void;
  abstract addKeywords(keywordIds: string[]): void;
  abstract addPlans(planIds: string[]): void;

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

  abstract init(context: PlanContext, selectedArtefactId?: string): void;
}
