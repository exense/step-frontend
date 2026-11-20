import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import {
  AugmentedControllerService,
  AuthService,
  DialogsService,
  FileDownloaderService,
  GridEditableService,
  GridLayoutExternalTabDirective,
  GridLayoutTabsComponent,
  ReportLayoutService,
  ScheduledTaskTemporaryStorageService,
  StepBasicsModule,
  WidgetsPersistenceStateService,
} from '@exense/step-core';
import { of, Subject } from 'rxjs';
import { AggregatedTreeNodeDrilldownComponent } from '../aggregated-tree-node-drilldown/aggregated-tree-node-drilldown.component';
import { AggregatedReportViewTreeStateContextService } from '../../services/aggregated-report-view-tree-state.service';
import { AltExecutionReportSettingsService } from '../../services/alt-execution-report-settings.service';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AltExecutionTabsService } from '../../services/alt-execution-tabs.service';
import { AggregatedTreeNodeType } from '../../shared/aggregated-tree-node';
import { DrilldownRootType } from '../../shared/drilldown-root-type';
import { DrillDownStackItemConfig, DrillDownStackItemType } from '../../shared/drilldown-stack-item';
import { AltExecutionTabsComponent } from './alt-execution-tabs.component';

const TREE_ROOTS = [
  {
    rootType: DrilldownRootType.TREE,
    label: 'Aggregated Execution Tree',
    type: DrillDownStackItemType.AGGREGATED_REPORT_NODE,
  },
  { rootType: DrilldownRootType.REPORT_TREE, label: 'Execution Trace Tree', type: DrillDownStackItemType.REPORT_NODE },
] as const;

describe('SED-4988 top tab labels', () => {
  let tabsFixture: ComponentFixture<AltExecutionTabsComponent>;
  let drilldownFixture: ComponentFixture<AggregatedTreeNodeDrilldownComponent>;
  let routeData: Subject<{ drilldownState: DrillDownStackItemConfig[] }>;

  beforeEach(async () => {
    routeData = new Subject();
    const namedNode = { id: 'named-node', name: 'Checkout', nodeType: AggregatedTreeNodeType.AGGREGATED_INFO };
    await TestBed.configureTestingModule({
      declarations: [AltExecutionTabsComponent, AggregatedTreeNodeDrilldownComponent],
      imports: [GridLayoutTabsComponent, GridLayoutExternalTabDirective, StepBasicsModule],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        AltExecutionTabsService,
        {
          provide: ActivatedRoute,
          useValue: {
            data: routeData,
            snapshot: { url: [], queryParams: {} },
            parent: { parent: { snapshot: { data: {} } } },
          },
        },
        { provide: AugmentedControllerService, useValue: { getReportNode: () => of(namedNode) } },
        {
          provide: AggregatedReportViewTreeStateContextService,
          useValue: { getState: () => ({ isInitialized$: of(true), findNodeById: () => namedNode }) },
        },
        { provide: AltExecutionStateService, useValue: { testCasesDisplayMode$: of(undefined) } },
        { provide: AltExecutionReportSettingsService, useValue: { details: () => signal(false) } },
        { provide: ScheduledTaskTemporaryStorageService, useValue: {} },
        {
          provide: WidgetsPersistenceStateService,
          useValue: { gridPresets: signal([]), selectedPreset: signal(undefined) },
        },
        { provide: GridEditableService, useValue: {} },
        { provide: AuthService, useValue: { hasRight: () => false } },
        { provide: DialogsService, useValue: {} },
        { provide: ReportLayoutService, useValue: {} },
        { provide: FileDownloaderService, useValue: {} },
      ],
    })
      // The panel contents do not participate in tab naming; retain the real routed-state and tab collaborators.
      .overrideTemplate(AggregatedTreeNodeDrilldownComponent, '')
      .compileComponents();

    TestBed.inject(AltExecutionTabsService).openDrilldownTab(['node-details', DrilldownRootType.TREE]);
    tabsFixture = TestBed.createComponent(AltExecutionTabsComponent);
    drilldownFixture = TestBed.createComponent(AggregatedTreeNodeDrilldownComponent);
    drilldownFixture.detectChanges();
    tabsFixture.detectChanges();
    await tabsFixture.whenStable();
  });

  afterEach(() => {
    drilldownFixture.destroy();
    tabsFixture.destroy();
    routeData.complete();
  });

  function showState(rootType: DrilldownRootType, descendants: DrillDownStackItemConfig[] = []): void {
    routeData.next({
      drilldownState: [{ type: DrillDownStackItemType.ROOT, rootType, nodeId: 'root' }, ...descendants],
    });
    tabsFixture.detectChanges();
  }

  function visibleTabLabels(): string[] {
    const host = tabsFixture.nativeElement as HTMLElement;
    return Array.from(host.querySelectorAll('[role="tab"]')).map((tab) => tab.textContent!.trim());
  }

  it.each(TREE_ROOTS)('AC-3: a root-only $rootType view uses $label in the top tab bar', ({ rootType, label }) => {
    showState(rootType);

    expect(visibleTabLabels()).toEqual(['Performance', label]);
  });

  it.each([
    { rootType: DrilldownRootType.KEYWORDS, label: 'Drilldown: Steps' },
    { rootType: DrilldownRootType.TESTCASES, label: 'Drilldown: Testcases' },
  ])('AC-4: the $rootType root retains $label in the top tab bar', ({ rootType, label }) => {
    showState(rootType);

    expect(visibleTabLabels()).toEqual(['Performance', label]);
  });

  it.each(TREE_ROOTS)(
    'AC-4: a named descendant of $rootType retains its name and returning restores $label',
    ({ rootType, label, type }) => {
      showState(rootType, [{ type, nodeId: 'named-node' }]);
      expect(visibleTabLabels()).toEqual(['Performance', 'Drilldown: Checkout']);

      showState(rootType);
      expect(visibleTabLabels()).toEqual(['Performance', label]);
    },
  );
});
