import { computed, effect, EffectRef, inject, Injectable, Injector, OnDestroy, signal } from '@angular/core';
import { PlanEditorStrategy } from '../types/plan-editor-strategy';
import { Subject } from 'rxjs';
import { AbstractArtefact, type ExecutionParameters, Plan } from '../../../client/step-client-module';
import { PlanContext } from '../types/plan-context.interface';

@Injectable({
  providedIn: 'root',
})
export class PlanEditorService implements PlanEditorStrategy, OnDestroy {
  private strategyChangedInternal$ = new Subject<void>();
  private _injector = inject(Injector);

  private planContextInit?: PlanContext;
  private selectedArtefactIdInit?: string;

  private strategy?: PlanEditorStrategy;

  private strategySyncEffects: EffectRef[] = [];

  private readonly planContextInternal = signal<PlanContext | undefined>(undefined);
  private readonly hasRedoInternal = signal(false);
  private readonly hasUndoInternal = signal(false);
  private readonly targetExecutionParametersInternal = signal<Record<string, string>>({});

  readonly hasRedo = this.hasRedoInternal.asReadonly();
  readonly hasUndo = this.hasUndoInternal.asReadonly();

  readonly planContext = this.planContextInternal.asReadonly();

  readonly plan = computed(() => {
    const planContext = this.planContextInternal();
    return planContext?.plan ?? ({} as Plan);
  });

  readonly strategyChanged$ = this.strategyChangedInternal$.asObservable();
  readonly targetExecutionParameters = this.targetExecutionParametersInternal.asReadonly();

  ngOnDestroy(): void {
    this.strategyChangedInternal$.complete();
    this.terminateStrategySubscriptions();
  }

  useStrategy(strategy: PlanEditorStrategy): void {
    this.terminateStrategySubscriptions();
    this.strategy = strategy;

    const effectUndo = effect(
      () => {
        const hasUndo = this.strategy!.hasUndo();
        this.hasUndoInternal.set(hasUndo);
      },
      { manualCleanup: true, injector: this._injector },
    );

    const effectRedo = effect(
      () => {
        const hasRedo = this.strategy!.hasRedo();
        this.hasRedoInternal.set(hasRedo);
      },
      { manualCleanup: true, injector: this._injector },
    );

    const effectPlanContext = effect(
      () => {
        const planContext = this.strategy!.planContext();
        this.planContextInternal.set(planContext);
      },
      { manualCleanup: true, injector: this._injector },
    );

    this.strategySyncEffects.push(effectUndo, effectRedo, effectPlanContext);

    const context = this.planContextInit;
    const selectedArtefactId = this.selectedArtefactIdInit;
    this.planContextInit = undefined;
    this.selectedArtefactIdInit = undefined;

    if (context) {
      strategy.init(context, selectedArtefactId);
    }
    this.strategyChangedInternal$.next();
  }

  removeStrategy(expectedStrategy?: PlanEditorStrategy): void {
    if (expectedStrategy && this.strategy !== expectedStrategy) {
      return;
    }

    this.terminateStrategySubscriptions();
    this.strategy = undefined;
    this.planContextInit = undefined;
    this.selectedArtefactIdInit = undefined;
    this.hasUndoInternal.set(false);
    this.hasRedoInternal.set(false);
    this.planContextInternal.set(undefined);
    this.targetExecutionParametersInternal.set({});
    this.strategyChangedInternal$.next();
  }

  addControl(artefactTypeId: string): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addControl(artefactTypeId);
  }
  addKeywords(keywordIds: string[]): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addKeywords(keywordIds);
  }

  moveOut(node?: AbstractArtefact): void {
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

  handlePlanContextChange(planContext?: PlanContext): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.handlePlanContextChange(planContext);
  }

  addPlans(planIds: string[]): void {
    if (!this.strategy) {
      return;
    }
    this.strategy.addPlans(planIds);
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
    this.strategySyncEffects.forEach((effectRef) => effectRef.destroy());
    this.strategySyncEffects = [];
  }

  setTargetExecutionParameters(params?: Record<string, string>): void {
    this.targetExecutionParametersInternal.set(params || {});
  }
}
