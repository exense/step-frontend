import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, provideRouter } from '@angular/router';
import {
  AggregatedReport,
  AggregatedReportView,
  ArtefactNodeSource,
  ArtefactService,
  AugmentedExecutionsService,
  DialogsService,
  ExecutionReportStaticLayoutRegistryService,
  ReportNode,
  SPLIT_EXPORTS,
  TreeComponent,
  TreeNodeComponent,
  TreeNodeNameTemplateDirective,
  TreeNodeTemplateDirective,
} from '@exense/step-core';
import { resizeObserverMock } from '@exense/step-core/testing';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AltExecutionTreeNodeAddonDirective } from '../../directives/alt-execution-tree-node-addon.directive';
import { DrilldownPartialTreeStateDirective } from '../../directives/drilldown-partial-tree-state.directive';
import { TreeNodeVisualStateDirective } from '../../directives/tree-node-visual-state.directive';
import { IsCurrentReportDetailsOpenedPipe } from '../../pipes/is-current-report-details-opened.pipe';
import { IsEmptyStatusPipe } from '../../pipes/is-empty-status.pipe';
import { AltExecutionDialogsService } from '../../services/alt-execution-dialogs.service';
import { AltExecutionDrilldownNavigationUtilsService } from '../../services/alt-execution-drilldown-navigation-utils.service';
import { AltExecutionNodesHelperService } from '../../services/alt-execution-nodes-helper.service';
import { AltExecutionReportSettingsService } from '../../services/alt-execution-report-settings.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import {
  AggregatedReportViewTreeStateContextService,
  AggregatedReportViewTreeStateService,
} from '../../services/aggregated-report-view-tree-state.service';
import { DrillDownStackItemType } from '../../shared/drilldown-stack-item';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { TestCasesDisplayMode } from '../../shared/test-cases-display-mode';
import { AltExecutionTreePartialComponent } from '../alt-execution-tree-partial/alt-execution-tree-partial.component';
import { AltExecutionTreeComponent } from '../alt-execution-tree/alt-execution-tree.component';
import { AggregatedTreeNodeDrilldownComponent } from './aggregated-tree-node-drilldown.component';

describe('Drilldown partial tree navigation', () => {
  it.each(['cached', 'delayed'] as const)(
    'focuses the report with %s data and preserves scrolling during refresh and opening details',
    fakeAsync((loadMode: 'cached' | 'delayed') => {
      const report: ReportNode = {
        _class: 'step.artefacts.reports.EchoReportNode',
        id: 'report-119',
        artefactID: 'node-119',
        artefactHash: 'hash-119',
        name: 'Last node',
        status: 'RUNNING',
      };
      const response = new Subject<AggregatedReport>();
      const timeRange = new BehaviorSubject<{ from: number; to: number; isManualChange?: boolean }>({
        from: 0,
        to: 1000,
      });
      const children: AggregatedReportView[] = Array.from({ length: 120 }, (_, index) => ({
        artefact: { _class: 'Echo', id: `node-${index}`, attributes: { name: `Node ${index}` } },
        artefactHash: `hash-${index}`,
        parentSource: ArtefactNodeSource.MAIN,
        countByStatus: { PASSED: 1 },
      }));
      const iteration: AggregatedReport = {
        partialTreeRootNodeId: 'iteration',
        aggregatedReportView: {
          artefact: { _class: 'Sequence', id: 'iteration', attributes: { name: 'Iteration' } },
          children,
        },
      };
      const routeData = new BehaviorSubject({
        drilldownState: [
          { type: DrillDownStackItemType.ROOT, rootType: DrilldownRootType.TESTCASES, nodeId: 'root' },
          { type: DrillDownStackItemType.REPORT_NODE, nodeId: report.id },
          { type: DrillDownStackItemType.PARTIAL_TREE, nodeId: report.id },
        ],
      });
      const getAggregatedReportView = jest.fn(() => (loadMode === 'cached' ? of(iteration) : response));
      TestBed.configureTestingModule({
        imports: [
          SPLIT_EXPORTS,
          TreeComponent,
          TreeNodeComponent,
          TreeNodeNameTemplateDirective,
          TreeNodeTemplateDirective,
          DrilldownPartialTreeStateDirective,
        ],
        declarations: [
          AggregatedTreeNodeDrilldownComponent,
          AltExecutionTreePartialComponent,
          AltExecutionTreeComponent,
          AltExecutionTreeNodeAddonDirective,
          TreeNodeVisualStateDirective,
          IsEmptyStatusPipe,
          IsCurrentReportDetailsOpenedPipe,
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          provideNoopAnimations(),
          provideRouter([]),
          AltExecutionTabsService,
          AggregatedReportViewTreeStateContextService,
          {
            provide: ActivatedRoute,
            useValue: { data: routeData, snapshot: { url: [], queryParams: {} } },
          },
          { provide: ExecutionReportStaticLayoutRegistryService, useValue: { get: () => undefined } },
          { provide: AltExecutionReportSettingsService, useValue: { details: () => signal([]) } },
          {
            provide: AltExecutionStateService,
            useValue: {
              execution$: of({ id: 'execution', status: 'RUNNING' }),
              executionId$: of('execution'),
              timeRange$: timeRange,
              testCasesDisplayMode$: of(TestCasesDisplayMode.AGGREGATED),
            },
          },
          { provide: AugmentedExecutionsService, useValue: { getAggregatedReportView } },
          { provide: ArtefactService, useValue: { getArtefactType: () => undefined, defaultIcon: 'folder' } },
          { provide: DialogsService, useValue: { showErrorMsg: () => of(undefined) } },
        ],
      }).overrideComponent(AggregatedTreeNodeDrilldownComponent, {
        set: {
          providers: [
            { provide: AltExecutionNodesHelperService, useValue: { getReportNode: () => of(report) } },
            {
              provide: AltExecutionDrilldownNavigationUtilsService,
              useValue: {
                getSingleReportNode: ({
                  singleInstanceReportNode,
                }: {
                  singleInstanceReportNode: ReportNode;
                }): ReportNode => singleInstanceReportNode,
                changeDrilldownLocation: jest.fn(),
              },
            },
            { provide: AltExecutionDialogsService, useValue: {} },
          ],
        },
      });

      const fixture = TestBed.createComponent(AggregatedTreeNodeDrilldownComponent);
      resizeObserverMock.resize(fixture.nativeElement, { width: 1200, height: 700 });
      fixture.autoDetectChanges();
      flushMicrotasks();
      expect(getAggregatedReportView).toHaveBeenCalledWith('execution', {
        range: { from: 0, to: 1000 },
        selectedReportNodeId: report.id,
      });

      if (loadMode === 'delayed') {
        response.next(iteration);
        response.complete();
      }
      fixture.detectChanges();
      const selectedNode: HTMLElement = fixture.nativeElement.querySelector('.tree-node-selected');
      expect(selectedNode).not.toBeNull();
      const selectedElement = selectedNode.closest('step-tree-node')!;
      const treeNodes = fixture.nativeElement.querySelectorAll('step-tree-node');
      expect(treeNodes).toHaveLength(121);
      expect(selectedElement).toBe(treeNodes[treeNodes.length - 1]);
      const scrollIntoView = jest.spyOn(selectedElement, 'scrollIntoView');
      tick(500);
      fixture.detectChanges();

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });

      scrollIntoView.mockClear();
      getAggregatedReportView.mockReturnValueOnce(of(iteration));
      timeRange.next({ from: 0, to: 2000 });
      flushMicrotasks();
      tick(500);
      fixture.detectChanges();
      expect(getAggregatedReportView).toHaveBeenCalledTimes(2);
      expect(scrollIntoView).not.toHaveBeenCalled();

      getAggregatedReportView.mockReturnValueOnce(of(iteration));
      timeRange.next({ from: 0, to: 3000, isManualChange: true });
      flushMicrotasks();
      tick(500);
      fixture.detectChanges();
      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });

      const partialTree = fixture.debugElement.query(By.directive(AltExecutionTreePartialComponent));
      const partialElement: HTMLElement = partialTree.nativeElement;
      const verticalScroller = partialElement.closest<HTMLElement>('.item-content')!;
      const horizontalScroller = partialElement.querySelector<HTMLElement>('step-tree')!;
      resizeObserverMock.resize(partialElement, { width: 540, height: 463 });
      verticalScroller.scrollTop = 9000;
      horizontalScroller.scrollLeft = 512;
      const panelContainer = partialElement.closest('step-split')!;
      const insertBefore = panelContainer.insertBefore.bind(panelContainer);
      // Happy DOM does not reset scrolling when a connected panel is moved, unlike the browser.
      jest.spyOn(panelContainer, 'insertBefore').mockImplementation((node, reference) => {
        const movesPartialTree = node.contains(partialElement);
        const result = insertBefore(node, reference);
        if (movesPartialTree) {
          verticalScroller.scrollTop = 0;
          horizontalScroller.scrollLeft = 0;
        }
        return result;
      });
      const clickedReport: ReportNode = { ...report, id: 'report-100', artefactID: 'node-100', name: 'Opened node' };
      const treeState = partialTree.injector.get(AggregatedReportViewTreeStateService);
      const clickedNode = treeState.findNodesByArtefactId('node-100')[0];
      treeState.selectNode(clickedNode);
      const clickedElement = partialElement.querySelector<HTMLElement>(
        `[data-tree-node-id="${clickedNode.id}"] step-tree-node-name`,
      )!;
      const revealSelectedNode = jest.spyOn(clickedElement, 'scrollIntoView');
      partialTree.componentInstance.openIterations.emit({
        node: { ...clickedNode, singleInstanceReportNode: clickedReport },
        restParams: {},
      });
      flushMicrotasks();
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('step-view-item')).toHaveLength(3);
      expect(fixture.nativeElement.querySelector('step-view-group')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('step-alt-execution-tree-partial')).toBe(partialElement);
      expect([verticalScroller.scrollTop, horizontalScroller.scrollLeft]).toEqual([9000, 512]);
      resizeObserverMock.resize(partialElement, { width: 210, height: 463 });
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(revealSelectedNode).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
      revealSelectedNode.mockClear();
      resizeObserverMock.resize(partialElement, { width: 210, height: 300 });
      resizeObserverMock.resize(partialElement, { width: 540, height: 463 });
      expect(revealSelectedNode).not.toHaveBeenCalled();
      fixture.destroy();
    }),
  );
});
