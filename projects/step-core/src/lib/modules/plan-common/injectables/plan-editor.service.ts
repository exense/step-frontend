import { Injectable, OnDestroy } from '@angular/core';
import { PlanEditorStrategy } from '../types/plan-editor-strategy';
import { BehaviorSubject, map, Subject, takeUntil } from 'rxjs';
import { AbstractArtefact, Plan } from '../../../client/step-client-module';
import { PlanContext } from '../types/plan-context.interface';

@Injectable({
  providedIn: 'root',
})
export class PlanEditorService implements PlanEditorStrategy, OnDestroy {
  private strategyChangedInternal$ = new Subject<void>();
  private strategyTerminator$?: Subject<void>;

  private planContextInit?: PlanContext;
  private selectedArtefactIdInit?: string;

  private strategy?: PlanEditorStrategy;

  private planContextInternal$ = new BehaviorSubject<PlanContext | undefined>(undefined);
  private hasRedoInternal$ = new BehaviorSubject(false);
  private hasUndoInternal$ = new BehaviorSubject(false);

  readonly hasRedo$ = this.hasRedoInternal$.asObservable();
  readonly hasUndo$ = this.hasUndoInternal$.asObservable();

  readonly planContext$ = this.planContextInternal$.asObservable();

  readonly plan$ = this.planContext$.pipe(map((context) => context?.plan));

  readonly strategyChanged$ = this.strategyChangedInternal$.asObservable();

  get planContext(): PlanContext | undefined {
    return this.strategy?.planContext;
  }

  get plan(): Plan | undefined {
    return this.strategy?.planContext?.plan;
  }

  ngOnDestroy(): void {
    this.strategyChangedInternal$.complete();
    this.terminateStrategySubscriptions();
    this.hasUndoInternal$.complete();
    this.hasRedoInternal$.complete();
    this.planContextInternal$.complete();
  }

  useStrategy(strategy: PlanEditorStrategy): void {
    this.terminateStrategySubscriptions();
    this.strategyTerminator$ = new Subject<void>();
    this.strategy = strategy;

    strategy.hasUndo$.pipe(takeUntil(this.strategyTerminator$)).subscribe({
      next: (value) => this.hasUndoInternal$.next(value),
    });

    strategy.hasRedo$.pipe(takeUntil(this.strategyTerminator$)).subscribe({
      next: (value) => this.hasRedoInternal$.next(value),
    });

    strategy.planContext$.pipe(takeUntil(this.strategyTerminator$)).subscribe({
      next: (value) => this.planContextInternal$.next(value),
    });

    if (this.planContextInit) {
      this.strategy.init(this.planContextInit, this.selectedArtefactIdInit);
      this.planContextInit = undefined;
      this.selectedArtefactIdInit = undefined;
    }
    this.strategyChangedInternal$.next();
  }

  removeStrategy(): void {
    this.terminateStrategySubscriptions();
    this.strategy = undefined;
    this.strategyChangedInternal$.next();
    this.hasUndoInternal$.next(false);
    this.hasRedoInternal$.next(false);
    this.planContextInternal$.next(undefined);
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

  toggleSkip(node?: AbstractArtefact, forceSkip?: boolean): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.toggleSkip(node, forceSkip);
  }

  init(context: PlanContext, selectedArtefactId?: string): void {
    if (!this.strategy) {
      this.planContextInit = context;
      this.selectedArtefactIdInit = selectedArtefactId;
      return;
    }
    this.strategy.init(context, selectedArtefactId);
  }

  terminateStrategySubscriptions(): void {
    this.strategyTerminator$?.next();
    this.strategyTerminator$?.complete();
    this.strategyTerminator$ = undefined;
  }
}
