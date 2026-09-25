import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as ace from 'ace-builds';
import { of } from 'rxjs';
import { KeywordsService, Plan, PlansService } from '../../../../client/step-client-module';
import { DialogsService } from '../../../basics/step-basics.module';
import { AceMode } from '../../../rich-editor/types/ace-mode.enum';
import { TreeStateService } from '../../../tree';
import { PlanContextApiService } from '../../injectables/plan-context-api.service';
import { PlanEditorPersistenceStateService } from '../../injectables/plan-editor-persistence-state.service';
import { PlanEditorService } from '../../injectables/plan-editor.service';
import { PlanContext } from '../../types/plan-context.interface';
import { SourcePlanEditorComponent } from './source-plan-editor.component';

jest.mock('ace-builds', () => ({
  edit: jest.fn(),
  require: jest.fn(),
}));
jest.mock('ace-builds/src-min-noconflict/ext-searchbox', () => ({}));
jest.mock('../plan-tree/plan-tree.component', () => ({
  PlanTreeComponent: class PlanTreeComponent {},
}));

type SourcePlan = Plan & { source: string };

const createSourceContext = (id: string, source: string): PlanContext => ({
  id,
  plan: {
    id,
    _class: 'test.source.Plan',
    source,
    root: {
      id: `${id}-root`,
      _class: 'Sequence',
    },
  } as SourcePlan,
  entity: {
    id,
    attributes: { name: id },
  },
  entityType: 'plan',
});

describe('SourcePlanEditorComponent', () => {
  let fixture: ComponentFixture<SourcePlanEditorComponent>;
  let planEditorService: PlanEditorService;
  let treeInit: jest.Mock;
  let compilePlan: jest.Mock;
  let savePlan: jest.Mock;
  let editorSetValue: jest.Mock;
  let editorDestroy: jest.Mock;
  let sessionOn: jest.Mock;
  let sessionOff: jest.Mock;

  beforeEach(async () => {
    treeInit = jest.fn();
    compilePlan = jest.fn();
    savePlan = jest.fn((context: PlanContext) => of(context));
    editorSetValue = jest.fn();
    editorDestroy = jest.fn();
    sessionOn = jest.fn();
    sessionOff = jest.fn();

    const undoManager = {
      reset: jest.fn(),
      hasUndo: jest.fn(() => false),
      hasRedo: jest.fn(() => false),
    };
    const session = {
      getUndoManager: jest.fn(() => undoManager),
      setMode: jest.fn(),
      setUseWorker: jest.fn(),
      on: sessionOn,
      off: sessionOff,
      insert: jest.fn(),
      clearAnnotations: jest.fn(),
      setAnnotations: jest.fn(),
    };
    const editor = {
      session,
      getSession: jest.fn(() => session),
      setTheme: jest.fn(),
      setOptions: jest.fn(),
      setValue: editorSetValue,
      getValue: jest.fn(() => ''),
      getSelectionRange: jest.fn(() => ({ end: { row: 0, column: 0 } })),
      focus: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      destroy: editorDestroy,
    } as unknown as ace.Ace.Editor;

    (ace.edit as jest.Mock).mockReturnValue(editor);

    await TestBed.configureTestingModule({
      imports: [SourcePlanEditorComponent],
      providers: [
        PlanEditorService,
        {
          provide: PlanContextApiService,
          useValue: { savePlan },
        },
        {
          provide: PlansService,
          useValue: {
            compilePlan,
            getPlanById: jest.fn(),
          },
        },
        {
          provide: KeywordsService,
          useValue: { getFunctionById: jest.fn() },
        },
        {
          provide: TreeStateService,
          useValue: { init: treeInit },
        },
        {
          provide: DialogsService,
          useValue: { showErrorMsg: jest.fn(() => of(undefined)) },
        },
        {
          provide: PlanEditorPersistenceStateService,
          useValue: {
            getPanelSize: jest.fn(),
            setPanelSize: jest.fn(),
          },
        },
      ],
    })
      .overrideComponent(SourcePlanEditorComponent, {
        set: {
          template: '<div #editor></div>',
          imports: [],
        },
      })
      .compileComponents();

    planEditorService = TestBed.inject(PlanEditorService);
  });

  it('consumes deferred context before Ace setup, reuses the strategy, and tears down safely', () => {
    const initialContext = createSourceContext('B', 'initial source');
    const updatedContext = createSourceContext('D', 'updated source');
    planEditorService.init(initialContext, 'B-selected');

    fixture = TestBed.createComponent(SourcePlanEditorComponent);
    fixture.componentRef.setInput('mode', AceMode.YAML);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(fixture.componentInstance.planContext()).toBe(initialContext);
    expect(treeInit).toHaveBeenCalledWith(initialContext.plan.root, { selectedNodeIds: ['B-selected'] });
    expect(editorSetValue).toHaveBeenCalledWith('initial source', 1);
    expect(compilePlan).not.toHaveBeenCalled();
    expect(savePlan).not.toHaveBeenCalled();

    planEditorService.init(updatedContext);
    TestBed.flushEffects();

    expect(fixture.componentInstance.planContext()).toBe(updatedContext);
    expect(editorSetValue).toHaveBeenLastCalledWith('updated source', 1);
    expect(treeInit).toHaveBeenLastCalledWith(updatedContext.plan.root, {
      selectedNodeIds: ['D-root'],
    });

    const removeStrategy = jest.spyOn(planEditorService, 'removeStrategy');
    const changeCallback = sessionOn.mock.calls[0][1] as () => void;
    fixture.destroy();

    expect(removeStrategy).toHaveBeenCalledWith(fixture.componentInstance);
    expect(sessionOff).toHaveBeenCalledWith('change', changeCallback);
    expect(editorDestroy).toHaveBeenCalledTimes(1);
  });
});
