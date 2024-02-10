import { Injectable, OnDestroy } from '@angular/core';
import { Mutable, PlanEditorStrategy } from '../shared';
import { Observable, of, Subject } from 'rxjs';
import { AbstractArtefact, Plan } from '../client/generated';

type FieldAccessor = Mutable<Partial<Pick<PlanEditorService, 'hasRedo$' | 'hasUndo$' | 'plan$'>>>;

@Injectable({
  providedIn: 'root',
})
export class PlanEditorService implements PlanEditorStrategy, OnDestroy {
  private strategyChangedInternal$ = new Subject<void>();

  private planInit?: Plan;
  private selectedArtefactIdInit?: string;

  private strategy?: PlanEditorStrategy;

  readonly hasRedo$: Observable<boolean> = of(false);

  readonly hasUndo$: Observable<boolean> = of(false);

  readonly plan$: Observable<Plan | undefined> = of(undefined);

  readonly strategyChanged$ = this.strategyChangedInternal$.asObservable();

  get plan(): Plan | undefined {
    return this.strategy?.plan;
  }

  ngOnDestroy(): void {
    this.strategyChangedInternal$.complete();
  }

  useStrategy(strategy: PlanEditorStrategy): void {
    this.strategy = strategy;
    (this as FieldAccessor).hasRedo$ = strategy.hasRedo$;
    (this as FieldAccessor).hasUndo$ = strategy.hasUndo$;
    (this as FieldAccessor).plan$ = strategy.plan$;
    if (this.planInit) {
      this.strategy.init(this.planInit, this.selectedArtefactIdInit);
      this.planInit = undefined;
      this.selectedArtefactIdInit = undefined;
    }
    this.strategyChangedInternal$.next();
  }

  removeStrategy(): void {
    this.strategy = undefined;
    (this as FieldAccessor).hasRedo$ = of(false);
    (this as FieldAccessor).hasUndo$ = of(false);
    (this as FieldAccessor).plan$ = of(undefined);
    this.strategyChangedInternal$.next();
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

  moveOut(node?: AbstractArtefact) {
    if (!this.strategy) {
      return;
    }
    this.strategy.moveOut(node);
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

  moveInNextSibling(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.moveInNextSibling(node);
  }

  moveInPrevSibling(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.moveInPrevSibling(node);
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

  pasteAfter(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.pasteAfter(node);
  }

  duplicate(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.duplicate(node);
  }

  rename(node?: AbstractArtefact): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.rename(node);
  }

  toggleSkip(node?: AbstractArtefact, actionId?: string): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.toggleSkip(node, actionId);
  }

  init(plan: Plan, selectedArtefactId?: string): void {
    if (!this.strategy) {
      this.planInit = plan;
      this.selectedArtefactIdInit = selectedArtefactId;
      return;
    }
    this.strategy.init(plan, selectedArtefactId);
  }
}
