import { ChangeDetectorRef, Component, DestroyRef, inject, Injectable, OnDestroy, OnInit, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, of } from 'rxjs';
import {
  AbstractArtefact,
  ArtefactService,
  AugmentedPlansService,
  AuthService,
  CommonEntitiesUrlsService,
  CustomComponent,
  CustomItemRenderComponent,
  CustomRegistryService,
  CustomRegistryType,
  DialogsService,
  FunctionActionsService,
  KeywordsService,
  Plan,
  PlanContext,
  PlanContextApiService,
  PlanEditorPersistenceStateService,
  PlanEditorService,
  PlanEditorStrategy,
  PlanOpenService,
  PlanTypeComponent,
  TreeStateService,
} from '@exense/step-core';
import { InteractiveSessionService } from '../../injectables/interactive-session.service';
import { PlanEditorBaseComponent } from './plan-editor-base.component';

jest.mock('../../injectables/interactive-session.service', () => ({
  InteractiveSessionService: class InteractiveSessionService {},
}));

const VISUAL_PLAN = 'test.visual.Plan';
const VISUAL_PLAN_ALIAS = 'test.visual.AliasPlan';
const SOURCE_PLAN = 'test.source.Plan';
const UNKNOWN_PLAN = 'test.unknown.Plan';

interface EditorInitCall {
  editorType: 'visual' | 'source';
  instance: TestEditor;
  context: PlanContext;
  selectedArtefactId?: string;
  effectiveSelection?: string;
}

@Injectable()
class EditorTracker {
  readonly instances: TestEditor[] = [];
  readonly initCalls: EditorInitCall[] = [];

  register(instance: TestEditor): void {
    this.instances.push(instance);
  }

  recordInit(call: EditorInitCall): void {
    this.initCalls.push(call);
  }

  callsFor(editorType: EditorInitCall['editorType']): EditorInitCall[] {
    return this.initCalls.filter((call) => call.editorType === editorType);
  }
}

abstract class TestEditor implements CustomComponent, PlanEditorStrategy, OnInit, OnDestroy {
  private readonly _planEditor = inject(PlanEditorService);
  private readonly _tracker = inject(EditorTracker);
  private readonly planContextInternal = signal<PlanContext | undefined>(undefined);

  protected abstract readonly editorType: EditorInitCall['editorType'];

  context?: unknown;
  readonly planContext = this.planContextInternal.asReadonly();
  readonly hasUndo = signal(false).asReadonly();
  readonly hasRedo = signal(false).asReadonly();

  ngOnInit(): void {
    this._tracker.register(this);
    this._planEditor.useStrategy(this);
  }

  ngOnDestroy(): void {
    this._planEditor.removeStrategy(this);
  }

  init(context: PlanContext, selectedArtefactId?: string): void {
    this.planContextInternal.set(context);
    this._tracker.recordInit({
      editorType: this.editorType,
      instance: this,
      context,
      selectedArtefactId,
      effectiveSelection: selectedArtefactId ?? context.plan.root?.id,
    });
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

@Component({
  selector: 'step-test-visual-editor',
  template: '<div class="visual-editor"></div>',
})
class VisualTestEditorComponent extends TestEditor {
  protected readonly editorType = 'visual' as const;
}

@Component({
  selector: 'step-test-source-editor',
  template: '<div class="source-editor"></div>',
})
class SourceTestEditorComponent extends TestEditor {
  protected readonly editorType = 'source' as const;
}

@Component({
  selector: 'step-test-plan-editor-harness',
  template: '<step-plan-editor-base [initialPlanContext]="context" />',
  standalone: false,
})
class PlanEditorHarnessComponent implements OnInit {
  private readonly _changeDetector = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _planEditor = inject(PlanEditorService);

  context?: PlanContext;

  ngOnInit(): void {
    this._planEditor.strategyChanged$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._changeDetector.detectChanges());
  }
}

const createContext = (id: string, planClass: string): PlanContext => ({
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

describe('PlanEditorBaseComponent strategy handoff', () => {
  let fixture: ComponentFixture<PlanEditorBaseComponent> | undefined;
  let tracker: EditorTracker;
  let planEditor: PlanEditorService;
  let registry: CustomRegistryService;
  let planOpenState: { artefactId?: string; startInteractive?: boolean } | undefined;
  let routeQueryParams: Record<string, string>;
  let savePlan: jest.Mock;

  const stabilize = async (): Promise<void> => {
    fixture!.detectChanges();
    await fixture!.whenStable();
    fixture!.detectChanges();
    TestBed.flushEffects();
  };

  const openContext = async (context: PlanContext): Promise<void> => {
    fixture!.componentRef.setInput('initialPlanContext', context);
    await stabilize();
  };

  const createHost = (): ComponentFixture<PlanEditorBaseComponent> => {
    fixture = TestBed.createComponent(PlanEditorBaseComponent);
    fixture.detectChanges();
    return fixture;
  };

  const currentEditor = (): TestEditor | undefined => {
    const planType = fixture!.debugElement.query(By.directive(PlanTypeComponent));
    return planType?.componentInstance.componentInstance as TestEditor | undefined;
  };

  beforeEach(async () => {
    planOpenState = undefined;
    routeQueryParams = {};
    savePlan = jest.fn((context: PlanContext) => of(context));

    await TestBed.configureTestingModule({
      declarations: [PlanEditorBaseComponent, PlanEditorHarnessComponent, PlanTypeComponent, CustomItemRenderComponent],
      imports: [VisualTestEditorComponent, SourceTestEditorComponent],
      providers: [
        PlanEditorService,
        CustomRegistryService,
        EditorTracker,
        {
          provide: InteractiveSessionService,
          useValue: {
            isActive$: new BehaviorSubject(false),
            init: jest.fn(),
            startInteractive: jest.fn(() => of(undefined)),
            stopInteractive: jest.fn(() => of(undefined)),
            resetInteractive: jest.fn(() => of(undefined)),
            execute: jest.fn(() => of(undefined)),
          },
        },
        {
          provide: TreeStateService,
          useValue: {
            selectNodeById: jest.fn(),
            getSelectedNodes: jest.fn(() => []),
          },
        },
        {
          provide: PlanContextApiService,
          useValue: {
            createRepositoryObjectReference: jest.fn(),
            createContextDuplicate: jest.fn((context: PlanContext) => ({
              ...context,
              plan: {
                ...context.plan,
                root: context.plan.root ? { ...context.plan.root } : undefined,
              },
            })),
            savePlan,
          },
        },
        {
          provide: AugmentedPlansService,
          useValue: {
            getArtefactTemplates: jest.fn(() => of([])),
            getYamlPlan: jest.fn(() => of('')),
          },
        },
        { provide: KeywordsService, useValue: {} },
        { provide: DialogsService, useValue: {} },
        { provide: FunctionActionsService, useValue: { openFunctionEditor: jest.fn(() => of(undefined)) } },
        {
          provide: ArtefactService,
          useValue: { getArtefactType: jest.fn(() => ({ icon: '' })) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParams(): Record<string, string> {
                return routeQueryParams;
              },
            },
          },
        },
        {
          provide: PlanOpenService,
          useValue: { getLastPlanOpenState: jest.fn(() => planOpenState) },
        },
        {
          provide: PlanEditorPersistenceStateService,
          useValue: { getPanelSize: jest.fn(), setPanelSize: jest.fn() },
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: Router, useValue: { navigateByUrl: jest.fn(), navigate: jest.fn() } },
        { provide: CommonEntitiesUrlsService, useValue: { planEditorUrl: jest.fn() } },
        { provide: AuthService, useValue: { hasRight: jest.fn(() => true) } },
      ],
    })
      .overrideComponent(PlanEditorBaseComponent, {
        set: {
          template: `
            @if (planClass) {
              <step-plan-type [itemKey]="planClass" />
            }
          `,
          providers: [],
        },
      })
      .compileComponents();

    tracker = TestBed.inject(EditorTracker);
    planEditor = TestBed.inject(PlanEditorService);
    registry = TestBed.inject(CustomRegistryService);
    registry.register(CustomRegistryType.PLAN_TYPE, VISUAL_PLAN, {
      type: VISUAL_PLAN,
      label: 'Visual',
      component: VisualTestEditorComponent,
    });
    registry.register(CustomRegistryType.PLAN_TYPE, VISUAL_PLAN_ALIAS, {
      type: VISUAL_PLAN_ALIAS,
      label: 'Visual alias',
      component: VisualTestEditorComponent,
    });
    registry.register(CustomRegistryType.PLAN_TYPE, SOURCE_PLAN, {
      type: SOURCE_PLAN,
      label: 'Source',
      component: SourceTestEditorComponent,
    });
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
  });

  it('initializes either editor exactly once on first opening', async () => {
    createHost();
    await openContext(createContext('A', VISUAL_PLAN));

    expect(tracker.callsFor('visual')).toHaveLength(1);
    expect(tracker.callsFor('visual')[0].context.id).toBe('A');

    fixture!.destroy();
    fixture = undefined;
    createHost();
    await openContext(createContext('B', SOURCE_PLAN));

    expect(tracker.callsFor('source')).toHaveLength(1);
    expect(tracker.callsFor('source')[0].context.id).toBe('B');
  });

  it('exposes plan context and action configuration as input signals', async () => {
    const context = createContext('A', VISUAL_PLAN);
    const actionsConfig = { showExecuteButton: false, showExportSourceButton: true };
    createHost();

    fixture!.componentRef.setInput('actionsConfig', actionsConfig);
    await openContext(context);

    expect(fixture!.componentInstance.initialPlanContext()).toBe(context);
    expect(fixture!.componentInstance.actionsConfig()).toBe(actionsConfig);
  });

  it('hands context from visual to source and back without initializing the outgoing editor', async () => {
    createHost();
    await openContext(createContext('A', VISUAL_PLAN));
    await openContext(createContext('B', SOURCE_PLAN));
    await openContext(createContext('C', VISUAL_PLAN));

    expect(tracker.callsFor('visual').map((call) => call.context.id)).toEqual(['A', 'C']);
    expect(tracker.callsFor('source').map((call) => call.context.id)).toEqual(['B']);
    expect(currentEditor()).toBeInstanceOf(VisualTestEditorComponent);
  });

  it('reuses an editor for plans mapped to the same registered component', async () => {
    createHost();
    await openContext(createContext('A', VISUAL_PLAN));
    const firstVisualInstance = currentEditor();

    await openContext(createContext('C', VISUAL_PLAN));
    await openContext(createContext('Alias', VISUAL_PLAN_ALIAS));

    expect(currentEditor()).toBe(firstVisualInstance);
    expect(tracker.callsFor('visual').map((call) => call.context.id)).toEqual(['A', 'C', 'Alias']);

    await openContext(createContext('B', SOURCE_PLAN));
    const firstSourceInstance = currentEditor();
    await openContext(createContext('D', SOURCE_PLAN));

    expect(currentEditor()).toBe(firstSourceInstance);
    expect(tracker.callsFor('source').map((call) => call.context.id)).toEqual(['B', 'D']);
  });

  it('preserves explicit preselection and uses the root fallback when selection is omitted', async () => {
    planOpenState = { artefactId: 'selected-node' };
    routeQueryParams = { artefactId: 'url-node' };
    createHost();
    await openContext(createContext('A', VISUAL_PLAN));

    expect(tracker.callsFor('visual')[0].selectedArtefactId).toBe('selected-node');
    expect(tracker.callsFor('visual')[0].effectiveSelection).toBe('selected-node');

    planOpenState = undefined;
    routeQueryParams = {};
    await openContext(createContext('B', SOURCE_PLAN));

    expect(tracker.callsFor('source')[0].selectedArtefactId).toBeUndefined();
    expect(tracker.callsFor('source')[0].effectiveSelection).toBe('B-root');
  });

  it('applies consecutive plan-type saves once and replaces the editor only when required', async () => {
    const savedVisualContext = createContext('A-saved', VISUAL_PLAN);
    savedVisualContext.plan.root!._class = 'SavedVisualRoot';
    const savedSourceContext = createContext('B-saved', SOURCE_PLAN);
    savedSourceContext.plan.root!._class = 'SavedSourceRoot';
    savePlan.mockReturnValueOnce(of(savedVisualContext)).mockReturnValueOnce(of(savedSourceContext));

    createHost();
    await openContext(createContext('A', VISUAL_PLAN));
    const visualInstance = currentEditor();
    const control = (
      fixture!.componentInstance as unknown as {
        planTypeControl: FormControl<{ planType: string; icon: string } | null>;
      }
    ).planTypeControl;

    control.setValue({ planType: 'SavedVisualRoot', icon: '' });
    TestBed.flushEffects();

    expect(currentEditor()).toBe(visualInstance);
    expect(tracker.callsFor('visual').map((call) => call.context.id)).toEqual(['A', 'A-saved']);

    control.setValue({ planType: 'SavedSourceRoot', icon: '' });
    await stabilize();

    expect(savePlan).toHaveBeenCalledTimes(2);
    expect(tracker.callsFor('source').map((call) => call.context.id)).toEqual(['B-saved']);
    expect(currentEditor()).toBeInstanceOf(SourceTestEditorComponent);
  });

  it('does not leak pending or active context across host destruction', async () => {
    createHost();
    fixture!.componentInstance.initializeContext(createContext('pending', VISUAL_PLAN), true);
    fixture!.destroy();
    fixture = undefined;

    createHost();
    await openContext(createContext('B', SOURCE_PLAN));
    expect(tracker.initCalls.map((call) => call.context.id)).toEqual(['B']);

    fixture!.destroy();
    fixture = undefined;
    TestBed.flushEffects();
    expect(planEditor.planContext()).toBeUndefined();

    createHost();
    await openContext(createContext('C', VISUAL_PLAN));
    expect(tracker.initCalls.map((call) => call.context.id)).toEqual(['B', 'C']);
  });

  it('clears an unsupported editor request before opening a later supported editor', async () => {
    createHost();
    await openContext(createContext('A', VISUAL_PLAN));
    await openContext(createContext('unknown', UNKNOWN_PLAN));

    expect(currentEditor()).toBeUndefined();

    await openContext(createContext('B', SOURCE_PLAN));

    expect(tracker.callsFor('visual').map((call) => call.context.id)).toEqual(['A']);
    expect(tracker.callsFor('source').map((call) => call.context.id)).toEqual(['B']);
  });

  it('supports synchronous strategy-change detection during navigation and destruction', async () => {
    const harnessFixture = TestBed.createComponent(PlanEditorHarnessComponent);
    harnessFixture.detectChanges();
    const harness = harnessFixture.componentInstance;

    harness.context = createContext('A', VISUAL_PLAN);
    expect(() => harnessFixture.detectChanges()).not.toThrow();
    await harnessFixture.whenStable();
    harnessFixture.detectChanges();
    TestBed.flushEffects();

    harness.context = createContext('B', SOURCE_PLAN);
    expect(() => harnessFixture.detectChanges()).not.toThrow();
    await harnessFixture.whenStable();
    TestBed.flushEffects();

    expect(tracker.callsFor('visual').map((call) => call.context.id)).toEqual(['A']);
    expect(tracker.callsFor('source').map((call) => call.context.id)).toEqual(['B']);
    expect(() => harnessFixture.destroy()).not.toThrow();
  });
});
