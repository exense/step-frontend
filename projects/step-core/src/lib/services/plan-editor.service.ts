import { Injectable } from '@angular/core';
import { Mutable, PlanEditorStrategy } from '../shared';
import { Observable, of } from 'rxjs';
import { AbstractArtefact, Plan } from '../client/generated';

type FieldAccessor = Mutable<Partial<Pick<PlanEditorService, 'hasRedo$' | 'hasUndo$' | 'plan$'>>>;

@Injectable({
  providedIn: 'root',
})
export class PlanEditorService implements PlanEditorStrategy {
  private planInit?: Plan;

  private strategy?: PlanEditorStrategy;

  readonly hasRedo$: Observable<boolean> = of(false);

  readonly hasUndo$: Observable<boolean> = of(false);

  readonly plan$: Observable<Plan | undefined> = of(undefined);

  get plan(): Plan | undefined {
    return this.strategy?.plan;
  }

  useStrategy(strategy: PlanEditorStrategy): void {
    this.strategy = strategy;
    (this as FieldAccessor).hasRedo$ = strategy.hasRedo$;
    (this as FieldAccessor).hasUndo$ = strategy.hasUndo$;
    (this as FieldAccessor).plan$ = strategy.plan$;
    if (this.planInit) {
      this.strategy.init(this.planInit);
      this.planInit = undefined;
    }
  }

  removeStrategy(): void {
    this.strategy = undefined;
    (this as FieldAccessor).hasRedo$ = of(false);
    (this as FieldAccessor).hasUndo$ = of(false);
    (this as FieldAccessor).plan$ = of(undefined);
  }

  addControl(artefactTypeId: string): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addControl(artefactTypeId);
  }
  addFunction(keywordId: string): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addFunction(keywordId);
  }

  moveUp(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.moveUp(node);
  }

  moveDown(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.moveDown(node);
  }

  handlePlanChange(): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.handlePlanChange();
  }

  addPlan(planId: string): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addPlan(planId);
  }

  undo(): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.undo();
  }

  redo(): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.redo();
  }

  discardAll(): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.discardAll();
  }

  delete(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.delete(node);
  }

  copy(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.copy(node);
  }

  paste(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.paste(node);
  }

  rename(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.rename(node);
  }

  toggleSkip(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.toggleSkip(node);
  }

  init(plan: Plan): void {
    if (!this.strategy) {
      this.planInit = plan;
      return;
    }
    this.strategy.init(plan);
  }
}
