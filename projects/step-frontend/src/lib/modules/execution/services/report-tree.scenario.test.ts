import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  ArtefactService,
  ControllerService,
  ReportNode,
  StepBasicsModule,
  StepIconsModule,
  StepMaterialModule,
  TreeNodeUtilsService,
  TreeComponent,
} from '@exense/step-core';
import { firstValueFrom, of, Subject } from 'rxjs';
import { AltExecutionTreeControlPanelComponent } from '../components/alt-execution-tree-control-panel/alt-execution-tree-control-panel.component';
import { AltExecutionTreeNonAggregatedComponent } from '../components/alt-execution-tree-non-aggregated/alt-execution-tree-non-aggregated.component';
import { AltExecutionTreeNonAggregatedWidgetDirective } from '../directives/alt-execution-tree-non-aggregated-widget.directive';
import { REPORT_NODE_TREE_WIDGET_STATE } from './aggregated-report-view-tree-state.service';
import { EXECUTION_TREE_PAGING_SETTINGS, ExecutionTreePagingService } from './execution-tree-paging.service';
import { ReportTreeNodeUtilsService } from './report-tree-node-utils.service';
import { ReportTreeStateService } from './report-tree-state.service';
import { ReportNodeWithChildren } from '../shared/report-node-with-children';
import { ReportTreeNode } from '../shared/report-tree-node';
import { ExecutionTreeAction } from '../shared/execution-tree-action.enum';

@Component({
  selector: 'step-report-tree-test',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [AltExecutionTreeNonAggregatedWidgetDirective],
  template: `
    <step-alt-execution-tree-control-panel />
    <step-alt-execution-tree-non-aggregated />
  `,
})
class ReportTreeTestComponent {}

const node = (id: string, children?: ReportNodeWithChildren[]): ReportNodeWithChildren => ({
  id,
  name: id,
  _class: 'ReportNode',
  parentSource: 'MAIN',
  resolvedArtefact: { _class: 'Sequence' },
  children,
});

describe('Report tree interactions', () => {
  let children: Record<string, ReportNode[]>;
  const getChildren = jest.fn();

  beforeEach(() => {
    children = {};
    getChildren
      .mockReset()
      .mockImplementation((id: string, skip = 0, limit = 2) => of((children[id] ?? []).slice(skip, skip + limit)));
    TestBed.configureTestingModule({
      declarations: [ReportTreeTestComponent, AltExecutionTreeControlPanelComponent],
      imports: [AltExecutionTreeNonAggregatedComponent, StepBasicsModule, StepIconsModule, StepMaterialModule],
      providers: [
        provideNoopAnimations(),
        ReportTreeStateService,
        ReportTreeNodeUtilsService,
        { provide: TreeNodeUtilsService, useExisting: ReportTreeNodeUtilsService },
        { provide: REPORT_NODE_TREE_WIDGET_STATE, useExisting: ReportTreeStateService },
        { provide: EXECUTION_TREE_PAGING_SETTINGS, useValue: {} },
        { provide: ExecutionTreePagingService, useValue: { getExecutionTreePaging: () => 2 } },
        { provide: ControllerService, useValue: { getReportNodeChildren: getChildren } },
        { provide: ArtefactService, useValue: { getArtefactType: () => ({ icon: 'folder' }) } },
      ],
    });
  });

  it('collapses and expands all loaded descendants, including manually loaded children, without fetching more', () => {
    const fixture = TestBed.createComponent(ReportTreeTestComponent);
    const state = TestBed.inject(ReportTreeStateService);
    state.init(node('root', [node('branch', [node('deeper')])]), { expandAllByDefault: false });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const toolbarButtons = element.querySelectorAll<HTMLButtonElement>('step-alt-execution-tree-control-panel button');
    const visibleIds = (): string[] =>
      Array.from(element.querySelectorAll<HTMLElement>('[data-tree-node-id]')).map(
        (item) => item.dataset['treeNodeId']!,
      );

    toolbarButtons[1].click();
    fixture.detectChanges();
    expect(visibleIds()).toEqual(['root', 'branch', 'deeper']);
    expect(getChildren).not.toHaveBeenCalled();

    children['deeper'] = [node('leaf')];
    element.querySelector<HTMLButtonElement>('[data-tree-node-id="deeper"] button')!.click();
    fixture.detectChanges();
    expect(visibleIds()).toEqual(['root', 'branch', 'deeper', 'leaf']);
    const requestsAfterManualExpansion = getChildren.mock.calls.length;

    toolbarButtons[0].click();
    fixture.detectChanges();
    expect(visibleIds()).toEqual(['root']);
    toolbarButtons[1].click();
    fixture.detectChanges();
    expect(visibleIds()).toEqual(['root', 'branch', 'deeper', 'leaf']);
    expect(getChildren).toHaveBeenCalledTimes(requestsAfterManualExpansion);
    fixture.destroy();
  });

  it('marks omitted children and pages grouped nodes without offering a nonexistent next page', async () => {
    children['root'] = [node('before'), node('main'), node('last')];
    children['root'][0].parentSource = 'BEFORE';
    children['root'][1].parentSource = 'BEFORE';
    const state = TestBed.inject(ReportTreeStateService);
    const root = node('root');
    state.init(root, { depth: 1 });
    const fixture = TestBed.createComponent(ReportTreeTestComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Some children are not shown');

    const treeView = fixture.debugElement.query(By.directive(TreeComponent))
      .componentInstance as TreeComponent<ReportTreeNode>;
    const page = (actionId: ExecutionTreeAction): void => {
      treeView.treeContextAction.emit({ actionId, node: state.findNodeById('root') });
      fixture.detectChanges();
    };

    const tree = fixture.debugElement.children[1].componentInstance as AltExecutionTreeNonAggregatedComponent;
    const actions = await firstValueFrom(tree.getActionsForNode(state.findNodeById('root')!));
    expect(actions.find((action) => action.id === ExecutionTreeAction.LOAD_NEXT_NODES)?.disabled).toBe(false);
    page(ExecutionTreeAction.LOAD_NEXT_NODES);
    expect(state.findNodeById('last')).toBeDefined();
    expect(element.textContent).toContain('Some children are not shown');
    const lastActions = await firstValueFrom(tree.getActionsForNode(state.findNodeById('root')!));
    expect(lastActions.find((action) => action.id === ExecutionTreeAction.LOAD_NEXT_NODES)?.disabled).toBe(true);
    expect(lastActions.find((action) => action.id === ExecutionTreeAction.LOAD_PREVIOUS_NODES)?.disabled).toBe(false);
    page(ExecutionTreeAction.LOAD_PREVIOUS_NODES);
    expect(state.findNodeById('before')).toBeDefined();
    expect(element.textContent).toContain('Some children are not shown');
    fixture.destroy();
  });

  it('leaves complete pages unmarked, including pages exactly at the limit', async () => {
    const state = TestBed.inject(ReportTreeStateService);
    children['root'] = [node('first'), node('second')];
    state.init(node('root'), { depth: 1 });
    const fixture = TestBed.createComponent(ReportTreeTestComponent);
    fixture.detectChanges();
    const tree = fixture.debugElement.children[1].componentInstance as AltExecutionTreeNonAggregatedComponent;
    const actions = await firstValueFrom(tree.getActionsForNode(state.findNodeById('root')!));
    expect(actions.find((action) => action.id === ExecutionTreeAction.LOAD_NEXT_NODES)?.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).not.toContain('Some children are not shown');
    fixture.destroy();
  });

  it('ignores a stale depth load after another execution is opened', () => {
    const pending = new Subject<ReportNode[]>();
    getChildren.mockReturnValueOnce(pending);
    const state = TestBed.inject(ReportTreeStateService);
    state.init(node('old'), { depth: 2 });
    state.init(node('new', [node('new-child')]));
    pending.next([node('old-child')]);
    pending.complete();
    expect(state.flatTree().map((item) => item.id)).toEqual(['new', 'new-child']);
    state.cleanup();
    expect(state.flatTree()).toEqual([]);
  });
});
