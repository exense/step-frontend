import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AggregatedReport,
  ArtefactService,
  AugmentedExecutionsService,
  DialogsService,
  ReportNode,
  StepBasicsModule,
  StepIconsModule,
  StepMaterialModule,
  TREE_EXPORTS,
  TreeNodeUtilsService,
  TreeStateService,
} from '@exense/step-core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AltExecutionTreePartialComponent } from './alt-execution-tree-partial.component';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { AggregatedTreeNodeComponent } from '../aggregated-tree-node/aggregated-tree-node.component';
import { AltExecutionTreeNodeAddonDirective } from '../../directives/alt-execution-tree-node-addon.directive';
import { TreeNodeVisualStateDirective } from '../../directives/tree-node-visual-state.directive';
import { AggregatedReportViewTreeStateService } from '../../services/aggregated-report-view-tree-state.service';
import { AggregatedReportViewTreeNodeUtilsService } from '../../services/aggregated-report-view-tree-node-utils.service';
import { AggregatedReportViewTreeSearchFacadeService } from '../../services/aggregated-report-view-tree-search-facade.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { IsEmptyStatusPipe } from '../../pipes/is-empty-status.pipe';
import { IsCurrentReportDetailsOpenedPipe } from '../../pipes/is-current-report-details-opened.pipe';
import { TimeRangeExt } from '../../shared/time-range-ext';

const REPORT_NODE: ReportNode = {
  id: 'report-node',
  _class: 'ReportNode',
  artefactID: 'sequence',
  status: 'PASSED',
};

const REPORT: AggregatedReport = {
  partialTreeRootNodeId: REPORT_NODE.id,
  aggregatedReportView: {
    artefact: { id: 'sequence', _class: 'Sequence', attributes: { name: 'Executed sequence' } },
    countByStatus: { PASSED: 1 },
    children: [
      {
        artefact: { id: 'step', _class: 'Sequence', attributes: { name: 'Executed child' } },
        parentSource: 'MAIN',
        countByStatus: { PASSED: 1 },
      },
    ],
  },
};

describe('Inspect executed path loading', () => {
  let fixture: ComponentFixture<AltExecutionTreePartialComponent>;
  let timeRange: BehaviorSubject<TimeRangeExt | undefined>;
  let requests: Subject<AggregatedReport>[];
  const getAggregatedReportView = jest.fn();

  beforeEach(async () => {
    timeRange = new BehaviorSubject<TimeRangeExt | undefined>({ from: 0, to: 100 });
    requests = [];
    getAggregatedReportView.mockReset().mockImplementation(() => {
      const request = new Subject<AggregatedReport>();
      requests.push(request);
      return request;
    });
    TestBed.configureTestingModule({
      declarations: [
        AltExecutionTreePartialComponent,
        AltExecutionTreeComponent,
        AggregatedTreeNodeComponent,
        AltExecutionTreeNodeAddonDirective,
        TreeNodeVisualStateDirective,
        IsEmptyStatusPipe,
        IsCurrentReportDetailsOpenedPipe,
      ],
      imports: [StepBasicsModule, StepIconsModule, StepMaterialModule, ...TREE_EXPORTS],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        AggregatedReportViewTreeStateService,
        AggregatedReportViewTreeNodeUtilsService,
        AggregatedReportViewTreeSearchFacadeService,
        { provide: TreeNodeUtilsService, useExisting: AggregatedReportViewTreeNodeUtilsService },
        { provide: TreeStateService, useExisting: AggregatedReportViewTreeStateService },
        { provide: AugmentedExecutionsService, useValue: { getAggregatedReportView } },
        { provide: DialogsService, useValue: {} },
        {
          provide: ArtefactService,
          useValue: { getArtefactType: () => ({ icon: 'folder' }), defaultIcon: 'folder' },
        },
        {
          provide: AltExecutionStateService,
          useValue: { executionId$: of('execution'), execution$: of({ status: 'RUNNING' }), timeRange$: timeRange },
        },
      ],
    });
    // Rich node details are unrelated to loading; keep the real tree, conversion, selection, and search.
    TestBed.overrideComponent(AggregatedTreeNodeComponent, { set: { template: '{{ node()?.name }}' } });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AltExecutionTreePartialComponent);
    fixture.componentRef.setInput('node', REPORT_NODE);
    fixture.componentRef.setInput('autoFocusNode', false);
  });

  afterEach(() => fixture.destroy());

  it('keeps a slow initial path load visible through automatic refreshes until the tree can render', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(getAggregatedReportView).toHaveBeenCalledTimes(1);
    expect(host.querySelector('mat-spinner, .tree-skeletons')).not.toBeNull();

    timeRange.next({ from: 0, to: 200 });
    fixture.detectChanges();
    expect(host.querySelector('mat-spinner, .tree-skeletons')).not.toBeNull();
    expect(getAggregatedReportView).toHaveBeenCalledTimes(1);

    requests[0].next(REPORT);
    requests[0].complete();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(host.querySelector('mat-spinner, .tree-skeletons')).toBeNull();
    expect(host.textContent).toContain('Executed sequence');
    expect(host.textContent).toContain('Executed child');
  }));

  it('shows loading while awaiting a range and explains empty or failed results, then recovers on a manual refresh', fakeAsync(() => {
    timeRange.next(undefined);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Loading executed path');
    expect(getAggregatedReportView).not.toHaveBeenCalled();

    timeRange.next({ from: 0, to: 100 });
    requests[0].next({});
    requests[0].complete();
    fixture.detectChanges();
    expect(host.textContent).toContain('No executed path is available');
    expect(host.querySelector('.tree-skeletons')).toBeNull();

    timeRange.next({ from: 0, to: 200, isManualChange: true });
    fixture.detectChanges();
    expect(host.querySelector('.tree-skeletons')).not.toBeNull();
    requests[1].error(new Error('The executed path could not be retrieved'));
    fixture.detectChanges();
    expect(host.textContent).toContain('Unable to load the executed path');

    timeRange.next({ from: 0, to: 300, isManualChange: true });
    fixture.detectChanges();
    expect(host.querySelector('.tree-skeletons')).not.toBeNull();
    requests[2].next(REPORT);
    requests[2].complete();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(host.textContent).toContain('Executed sequence');
    expect(host.textContent).not.toContain('Unable to load');
  }));

  it('switches pending paths and manual ranges immediately without letting cancelled requests replace the current tree', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.componentRef.setInput('node', { ...REPORT_NODE, id: 'other-report', status: 'RUNNING' });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(requests[0].observed).toBe(false);
    expect(getAggregatedReportView.mock.calls[1][1].selectedReportNodeId).toBe('other-report');
    expect(host.querySelector('.tree-skeletons')).not.toBeNull();

    timeRange.next({ from: 50, to: 100, isManualChange: true });
    fixture.detectChanges();
    expect(requests[1].observed).toBe(false);
    expect(host.querySelector('.tree-skeletons')).not.toBeNull();
    requests[1].next(REPORT);
    requests[1].complete();
    fixture.detectChanges();
    expect(host.textContent).not.toContain('Executed sequence');
    requests[2].next(REPORT);
    requests[2].complete();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(host.textContent).toContain('Executed sequence');

    timeRange.next({ from: 50, to: 200 });
    fixture.detectChanges();
    expect(getAggregatedReportView).toHaveBeenCalledTimes(4);
    expect(host.querySelector('.tree-skeletons')).toBeNull();
    expect(host.textContent).toContain('Executed sequence');
    timeRange.next({ from: 50, to: 300 });
    expect(getAggregatedReportView).toHaveBeenCalledTimes(4);
    requests[3].next(REPORT);
    requests[3].complete();
    fixture.detectChanges();
  }));
});
