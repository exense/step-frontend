import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import {
  AbstractArtefact,
  ArtefactService,
  ArtefactTreeNode,
  AuthService,
  AugmentedInteractivePlanExecutionService,
  AugmentedPlansService,
  AugmentedScreenService,
  CommonEntitiesUrlsService,
  CallPlan,
  DialogsService,
  FunctionActionsService,
  KeywordsService,
  IDE_MODE,
  LOCAL_STORAGE,
  PlanContext,
  PlanContextApiService,
  PlanEditorService,
  PlanOpenService,
  PlansService,
  SCREEN_WIDTH,
  TreeStateService,
  PlanReferencePolicyService,
  PlanTreeComponent,
  DRAG_DROP_EXPORTS,
  TableModule,
  StepMaterialModule,
  StepIconsModule,
  HasRightPipe,
  TableApiWrapperService,
  ItemsPerPageService,
  REPOSITORY_PARAMETERS,
} from '@exense/step-core';
import { MatDialog } from '@angular/material/dialog';
import { PlanEditorBaseComponent } from './components/plan-editor-base/plan-editor-base.component';
import { PlanCommonTreeEditorFormComponent } from './components/plan-common-tree-editor-form/plan-common-tree-editor-form.component';
import { PlanArtefactListComponent } from './components/plan-artefact-list/plan-artefact-list.component';
import { PlanNodesDragPreviewComponent } from './components/plan-nodes-drag-preview/plan-nodes-drag-preview.component';
import { ArtefactDropInfoPipe } from './pipes/artefact-drop-info.pipe';

function context(id: string): PlanContext {
  return {
    id,
    entityType: 'plans',
    entity: { id, attributes: { name: id } },
    plan: {
      id,
      _class: 'Plan',
      root: {
        id: `${id}-root`,
        _class: 'Sequence',
        attributes: { name: id },
        children: [{ id: `${id}-child`, _class: 'Sequence', attributes: { name: 'Child' }, children: [] }],
      },
    },
  };
}

function settle(fixture: ComponentFixture<PlanEditorBaseComponent>): void {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

describe('Plan editor context lifecycle', () => {
  const api = {
    createContextDuplicate: (value: PlanContext): PlanContext => JSON.parse(JSON.stringify(value)),
    createRepositoryObjectReference: jest.fn((id?: string) => ({
      repositoryID: 'local',
      repositoryParameters: { id },
    })),
    savePlan: jest.fn((value: PlanContext) => of(value)),
  };

  beforeEach(() => {
    api.createRepositoryObjectReference.mockClear();
    api.savePlan.mockClear();
    TestBed.configureTestingModule({
      declarations: [
        PlanEditorBaseComponent,
        PlanCommonTreeEditorFormComponent,
        PlanArtefactListComponent,
        PlanNodesDragPreviewComponent,
        ArtefactDropInfoPipe,
      ],
      imports: [
        CommonModule,
        PlanTreeComponent,
        DRAG_DROP_EXPORTS,
        TableModule,
        StepMaterialModule,
        StepIconsModule,
        HasRightPipe,
      ],
      providers: [
        provideNoopAnimations(),
        { provide: REPOSITORY_PARAMETERS, useValue: [] },
        provideRouter([{ path: 'plans/editor/:id', component: PlanEditorBaseComponent }]),
        { provide: PlanContextApiService, useValue: api },
        {
          provide: ArtefactService,
          useValue: {
            getArtefactType: () => ({ icon: 'list' }),
            defaultIcon: 'list',
            availableArtefacts$: of([{ type: 'Echo', label: 'Echo', icon: 'list' }]),
          },
        },
        { provide: AuthService, useValue: { hasRight: () => true, hasRight$: () => of(true) } },
        { provide: TableApiWrapperService, useValue: { getTableSettings: () => of({ columnSettingList: [] }) } },
        {
          provide: ItemsPerPageService,
          useValue: { getItemsPerPage: () => of([10]), getDefaultPageSizeItem: () => of(10) },
        },
        {
          provide: AugmentedPlansService,
          useValue: {
            getArtefactTemplates: () => of(['Sequence']),
            getPlanById: () => of({ id: 'referenced', attributes: { name: 'Referenced plan' } }),
            getArtefactType: (type: string) =>
              of({
                id: type === 'CallPlan' ? 'call-plan' : 'dropped',
                _class: type,
                attributes: {},
                dynamicName: { dynamic: false },
              }),
          },
        },
        {
          provide: AugmentedScreenService,
          useValue: {
            getDefaultParametersByScreenId: () => of({}),
            getInputsForScreenPost: () => of([{ id: 'attributes.name' }]),
            getScreenInputsByScreenIdWithCache: () => of([]),
          },
        },
        { provide: LOCAL_STORAGE, useValue: localStorage },
        { provide: SCREEN_WIDTH, useValue: of(1280) },
        ...[
          AugmentedInteractivePlanExecutionService,
          KeywordsService,
          PlansService,
          DialogsService,
          FunctionActionsService,
          CommonEntitiesUrlsService,
          MatDialog,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    });
    TestBed.overrideComponent(PlanEditorBaseComponent, {
      set: {
        template: `
          <section stepDragDropGroupContainer stepDropAreaId="planTree">
            <step-plan-common-tree-editor-form />
            <step-plan-artefact-list />
          </section>
        `,
        styles: [],
        styleUrls: [],
      },
    });
    TestBed.overrideComponent(PlanTreeComponent, {
      set: {
        template: `
          <step-drag-drop-container stepDropAreaId="planTree">
            <step-tree #tree>
              <ng-container *stepTreeNodeTemplate="let node">
                <step-tree-node-draggable [node]="node" (dragOver)="handleDragOver($event)" (dropNode)="handleDropNode($event)" />
              </ng-container>
            </step-tree>
          </step-drag-drop-container>
        `,
      },
    });
  });

  it.each([false, true])('preserves drag state, plan references and input changes with IDE mode %s', (ideMode) => {
    TestBed.overrideProvider(IDE_MODE, { useValue: ideMode });
    fakeAsync(() => {
      const fixture = TestBed.createComponent(PlanEditorBaseComponent);
      settle(fixture);
      const initialContext = context('first');
      fixture.componentRef.setInput('initialPlanContext', initialContext);
      settle(fixture);
      const tree =
        fixture.debugElement.injector.get<TreeStateService<AbstractArtefact, ArtefactTreeNode>>(TreeStateService);
      const editor = TestBed.inject(PlanEditorService);
      expect(editor.planContext()?.id).toBe('first');
      expect(tree.selectedNodeIds()).toEqual(['first-root']);
      api.createRepositoryObjectReference.mockClear();

      tree.notifyPotentialInsert!('first-root');
      settle(fixture);
      expect(api.createRepositoryObjectReference).not.toHaveBeenCalled();
      expect(api.savePlan).not.toHaveBeenCalled();
      expect(editor.hasUndo()).toBe(false);
      tree.notifyInsertionComplete!();
      tree.selectNode('first-child');
      settle(fixture);
      expect(tree.selectedNodeIds()).toEqual(['first-child']);
      tree.notifyPotentialInsert!('first-child');
      settle(fixture);
      expect(tree.selectedNodeIds()).toEqual(['first-child']);
      expect(api.createRepositoryObjectReference).not.toHaveBeenCalled();

      const element: HTMLElement = fixture.nativeElement;
      const source = element.querySelector<HTMLElement>('step-plan-artefact-list tr.content-row')!;
      const mutations: MutationRecord[] = [];
      const observer = new MutationObserver((records) => mutations.push(...records));
      observer.observe(source, { attributes: true, attributeFilter: ['draggable'] });
      const dragEvent = (type: string): Event => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, 'dataTransfer', { value: { setDragImage: jest.fn() } });
        return event;
      };
      source.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      source.dispatchEvent(dragEvent('dragstart'));
      settle(fixture);
      expect([...mutations, ...observer.takeRecords()]).toEqual([]);
      observer.disconnect();
      expect(tree.selectedNodeIds()).toEqual(['first-child']);
      const target = element.querySelector<HTMLElement>('[data-tree-node-id="first-child"] .node-content')!;
      target.dispatchEvent(dragEvent('dragover'));
      target.dispatchEvent(dragEvent('drop'));
      source.dispatchEvent(dragEvent('dragend'));
      settle(fixture);
      expect(tree.findNodeById('dropped')?.originalArtefact?._class).toBe('Echo');
      expect(api.savePlan).toHaveBeenCalled();
      expect(api.createRepositoryObjectReference).not.toHaveBeenCalled();

      tree.selectNode('first-child');
      editor.addPlans(['referenced']);
      settle(fixture);
      const callPlan = tree.findNodeById('call-plan')?.originalArtefact as AbstractArtefact & CallPlan;
      expect(callPlan.attributes?.['name']).toBe('Referenced plan');
      if (ideMode) {
        expect(callPlan.planId).toBeUndefined();
        expect(JSON.parse(callPlan.selectionAttributes!.value!)).toEqual({
          name: { value: 'Referenced plan', dynamic: false },
        });
        expect(
          TestBed.inject(PlanReferencePolicyService).canNavigateToReferencedPlan({
            _class: 'CallPlan',
            planId: 'referenced',
          } as AbstractArtefact & CallPlan),
        ).toBe(false);
      } else {
        expect(callPlan.planId).toBe('referenced');
        expect(callPlan.selectionAttributes).toBeUndefined();
      }
      expect(tree.findNodeById('first-child')?.children?.map((child) => child.id)).toEqual(['dropped', 'call-plan']);
      expect(api.createRepositoryObjectReference).not.toHaveBeenCalled();

      const nextContext = context('second');
      TestBed.inject(PlanOpenService).open('second', { artefactId: 'second-child' });
      fixture.componentRef.setInput('initialPlanContext', nextContext);
      settle(fixture);
      expect(editor.planContext()?.id).toBe('second');
      expect(tree.selectedNodeIds()).toEqual(['second-child']);
      expect(tree.findNodeById('dropped')).toBeUndefined();
      expect(api.createRepositoryObjectReference).toHaveBeenCalledTimes(1);
      expect(api.createRepositoryObjectReference).toHaveBeenCalledWith('second');
      fixture.destroy();
      tick(1000);
    })();
  });
});
