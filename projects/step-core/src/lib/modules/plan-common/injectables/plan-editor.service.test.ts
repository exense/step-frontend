import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractArtefact, Plan } from '../../../client/step-client-module';
import { PlanContext } from '../types/plan-context.interface';
import { PlanEditorStrategy } from '../types/plan-editor-strategy';
import { PlanEditorService } from './plan-editor.service';

class TestPlanEditorStrategy implements PlanEditorStrategy {
  private readonly planContextInternal = signal<PlanContext | undefined>(undefined);
  private readonly hasUndoInternal = signal(false);
  private readonly hasRedoInternal = signal(false);

  readonly planContext = this.planContextInternal.asReadonly();
  readonly hasUndo = this.hasUndoInternal.asReadonly();
  readonly hasRedo = this.hasRedoInternal.asReadonly();
  readonly initCalls: Array<{ context: PlanContext; selectedArtefactId?: string }> = [];

  onInit?: () => void;

  init(context: PlanContext, selectedArtefactId?: string): void {
    this.initCalls.push({ context, selectedArtefactId });
    this.planContextInternal.set(context);
    this.onInit?.();
  }

  setContext(context?: PlanContext): void {
    this.planContextInternal.set(context);
  }

  setHistoryState(hasUndo: boolean, hasRedo: boolean): void {
    this.hasUndoInternal.set(hasUndo);
    this.hasRedoInternal.set(hasRedo);
  }

  handlePlanContextChange(planContext?: PlanContext): void {
    this.planContextInternal.set(planContext);
  }

  addControl(artefactTypeId: string): void {}

  addKeywords(keywordIds: string[]): void {}

  addPlans(planIds: string[]): void {}

  undo(): void {}

  redo(): void {}

  discardAll(): void {}

  moveOut(node?: AbstractArtefact): void {}

  moveUp(node?: AbstractArtefact): void {}

  moveDown(node?: AbstractArtefact): void {}

  moveInNextSibling(node?: AbstractArtefact): void {}

  moveInPrevSibling(node?: AbstractArtefact): void {}

  delete(node?: AbstractArtefact): void {}

  copy(node?: AbstractArtefact): void {}

  paste(node?: AbstractArtefact): void {}

  pasteAfter(node?: AbstractArtefact): void {}

  duplicate(node?: AbstractArtefact): void {}

  rename(node?: AbstractArtefact): void {}

  toggleSkip(node?: AbstractArtefact, forceSkip?: boolean): void {}
}

const createContext = (id: string, planClass: string = 'step.core.plans.Plan'): PlanContext => ({
  id,
  plan: {
    id,
    _class: planClass,
    root: {
      id: `${id}-root`,
      _class: 'Sequence',
    },
  } as Plan,
  entity: {
    id,
    attributes: { name: id },
  },
  entityType: 'plan',
});

describe('PlanEditorService', () => {
  let service: PlanEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlanEditorService] });
    service = TestBed.inject(PlanEditorService);
  });

  it('delivers a deferred first initialization once', () => {
    const context = createContext('A');
    const strategy = new TestPlanEditorStrategy();

    service.init(context, 'A-node');
    service.useStrategy(strategy);
    TestBed.flushEffects();

    expect(strategy.initCalls).toEqual([{ context, selectedArtefactId: 'A-node' }]);
    expect(service.planContext()).toBe(context);
  });

  it('delivers only the latest pending context and clears its previous selection', () => {
    const contextA = createContext('A');
    const contextB = createContext('B');
    const strategy = new TestPlanEditorStrategy();

    service.init(contextA, 'A-node');
    service.init(contextB);
    service.useStrategy(strategy);

    expect(strategy.initCalls).toEqual([{ context: contextB, selectedArtefactId: undefined }]);
  });

  it('reuses an active strategy and initializes it immediately', () => {
    const contextA = createContext('A');
    const contextB = createContext('B');
    const strategy = new TestPlanEditorStrategy();

    service.useStrategy(strategy);
    service.init(contextA, 'A-node');
    service.init(contextB, 'B-node');

    expect(strategy.initCalls).toEqual([
      { context: contextA, selectedArtefactId: 'A-node' },
      { context: contextB, selectedArtefactId: 'B-node' },
    ]);
  });

  it('protects a replacement request from delayed removal of the old strategy', () => {
    const contextA = createContext('A');
    const contextB = createContext('B');
    const oldStrategy = new TestPlanEditorStrategy();
    const newStrategy = new TestPlanEditorStrategy();

    service.useStrategy(oldStrategy);
    service.init(contextA, 'A-node');
    service.removeStrategy();
    service.init(contextB, 'B-node');
    service.removeStrategy(oldStrategy);
    service.useStrategy(newStrategy);

    expect(oldStrategy.initCalls).toEqual([{ context: contextA, selectedArtefactId: 'A-node' }]);
    expect(newStrategy.initCalls).toEqual([{ context: contextB, selectedArtefactId: 'B-node' }]);
  });

  it('ignores late removal after the replacement strategy has registered', () => {
    const context = createContext('B');
    const oldStrategy = new TestPlanEditorStrategy();
    const newStrategy = new TestPlanEditorStrategy();
    let notificationCount = 0;

    service.useStrategy(oldStrategy);
    service.removeStrategy();
    service.init(context, 'B-node');
    service.useStrategy(newStrategy);
    newStrategy.setHistoryState(true, true);
    service.setTargetExecutionParameters({ target: 'B' });
    TestBed.flushEffects();
    const subscription = service.strategyChanged$.subscribe(() => notificationCount++);

    service.removeStrategy(oldStrategy);
    newStrategy.setContext(createContext('B-updated'));
    TestBed.flushEffects();

    expect(notificationCount).toBe(0);
    expect(service.planContext()?.id).toBe('B-updated');
    expect(service.hasUndo()).toBe(true);
    expect(service.hasRedo()).toBe(true);
    expect(service.targetExecutionParameters()).toEqual({ target: 'B' });
    subscription.unsubscribe();
  });

  it('clears current strategy state and stops its signal propagation', () => {
    const strategy = new TestPlanEditorStrategy();

    service.useStrategy(strategy);
    service.init(createContext('A'));
    strategy.setHistoryState(true, true);
    service.setTargetExecutionParameters({ target: 'A' });
    TestBed.flushEffects();

    service.removeStrategy(strategy);
    strategy.setContext(createContext('stale'));
    strategy.setHistoryState(true, true);
    TestBed.flushEffects();

    expect(service.planContext()).toBeUndefined();
    expect(service.hasUndo()).toBe(false);
    expect(service.hasRedo()).toBe(false);
    expect(service.targetExecutionParameters()).toEqual({});
  });

  it('does not replay an abandoned request after an unconditional reset', () => {
    const strategy = new TestPlanEditorStrategy();

    service.init(createContext('A'), 'A-node');
    service.removeStrategy();
    service.useStrategy(strategy);

    expect(strategy.initCalls).toEqual([]);

    service.removeStrategy();
    service.init(createContext('B'));
    service.useStrategy(strategy);

    expect(strategy.initCalls).toEqual([
      { context: expect.objectContaining({ id: 'B' }), selectedArtefactId: undefined },
    ]);
  });

  it('does not replay a request that was already consumed', () => {
    const firstStrategy = new TestPlanEditorStrategy();
    const secondStrategy = new TestPlanEditorStrategy();

    service.init(createContext('A'), 'A-node');
    service.useStrategy(firstStrategy);
    service.removeStrategy(firstStrategy);
    service.useStrategy(secondStrategy);

    expect(firstStrategy.initCalls).toHaveLength(1);
    expect(secondStrategy.initCalls).toEqual([]);
  });

  it('notifies reset subscribers only after state is cleared and preserves reentrant replacement work', () => {
    const oldStrategy = new TestPlanEditorStrategy();
    const replacementStrategy = new TestPlanEditorStrategy();
    const replacementContext = createContext('B');
    let handled = false;
    let stateObservedDuringReset: unknown;

    service.useStrategy(oldStrategy);
    service.init(createContext('A'));
    oldStrategy.setHistoryState(true, true);
    service.setTargetExecutionParameters({ target: 'A' });
    TestBed.flushEffects();

    const subscription = service.strategyChanged$.subscribe(() => {
      if (handled) {
        return;
      }
      handled = true;
      stateObservedDuringReset = {
        context: service.planContext(),
        hasUndo: service.hasUndo(),
        hasRedo: service.hasRedo(),
        parameters: service.targetExecutionParameters(),
      };
      service.init(replacementContext, 'B-node');
      service.useStrategy(replacementStrategy);
      service.setTargetExecutionParameters({ target: 'B' });
    });

    service.removeStrategy();
    TestBed.flushEffects();

    expect(stateObservedDuringReset).toEqual({ context: undefined, hasUndo: false, hasRedo: false, parameters: {} });
    expect(replacementStrategy.initCalls).toEqual([{ context: replacementContext, selectedArtefactId: 'B-node' }]);
    expect(service.planContext()).toBe(replacementContext);
    expect(service.targetExecutionParameters()).toEqual({ target: 'B' });
    subscription.unsubscribe();
  });

  it('keeps a newer request queued synchronously during pending initialization', () => {
    const contextA = createContext('A');
    const contextB = createContext('B');
    const firstStrategy = new TestPlanEditorStrategy();
    const secondStrategy = new TestPlanEditorStrategy();

    firstStrategy.onInit = () => {
      service.removeStrategy();
      service.init(contextB, 'B-node');
    };

    service.init(contextA, 'A-node');
    service.useStrategy(firstStrategy);
    service.useStrategy(secondStrategy);

    expect(firstStrategy.initCalls).toEqual([{ context: contextA, selectedArtefactId: 'A-node' }]);
    expect(secondStrategy.initCalls).toEqual([{ context: contextB, selectedArtefactId: 'B-node' }]);
  });
});
