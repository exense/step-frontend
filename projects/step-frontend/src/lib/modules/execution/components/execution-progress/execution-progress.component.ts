import { Component, forwardRef, inject, Inject, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import {
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  ControllerService,
  Dashlet,
  Execution,
  ExecutionCloseHandleService,
  ExecutionSummaryDto,
  IS_SMALL_SCREEN,
  ItemInfo,
  Operation,
  PrivateViewPluginService,
  ReportNode,
  selectionCollectionProvider,
  SelectionCollector,
  SystemService,
  TreeNodeUtilsService,
  TreeStateService,
  ViewRegistryService,
} from '@exense/step-core';
import { SingleExecutionPanelsService } from '../../services/single-execution-panels.service';
import { ExecutionErrorMessageItem } from '../../shared/execution-error-message-item';
import { ExecutionErrorCodeItem } from '../../shared/execution-error-code-item';
import { ErrorDistributionStatus } from '../../shared/error-distribution-status.enum';
import { ExecutionStateService } from '../../services/execution-state.service';
import { filter, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Panels } from '../../shared/panels.enum';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { ReportTreeNodeUtilsService } from '../../services/report-tree-node-utils.service';
import { EXECUTION_TREE_PAGING } from '../../services/execution-tree-paging';
import { DOCUMENT } from '@angular/common';
import { IncludeTestcases } from '../../shared/include-testcases.interface';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveExecutionsService } from '../../services/active-executions.service';

const R_ERROR_KEY = /\\\\u([\d\w]{4})/gi;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

enum UpdateSelection {
  ALL = 'all',
  ONLY_NEW = 'onlyNew',
  NONE = 'none',
}

interface RefreshParams {
  eId?: string;
  updateSelection?: UpdateSelection;
}

@Component({
  selector: 'step-execution-progress',
  templateUrl: './execution-progress.component.html',
  styleUrls: ['./execution-progress.component.scss'],
  providers: [
    {
      provide: EXECUTION_TREE_PAGING,
      useValue: {},
    },
    ReportTreeNodeUtilsService,
    {
      provide: TreeNodeUtilsService,
      useExisting: ReportTreeNodeUtilsService,
    },
    {
      provide: ExecutionStateService,
      useExisting: forwardRef(() => ExecutionProgressComponent),
    },
    {
      provide: ExecutionCloseHandleService,
      useExisting: forwardRef(() => ExecutionProgressComponent),
    },
    SingleExecutionPanelsService,
    ...selectionCollectionProvider('artefactID', AutoDeselectStrategy.KEEP_SELECTION),
    TreeStateService,
  ],
})
export class ExecutionProgressComponent
  implements OnInit, ExecutionStateService, ExecutionCloseHandleService, OnDestroy
{
  private _document = inject(DOCUMENT);
  private _executionService = inject(AugmentedExecutionsService);
  private _controllerService = inject(ControllerService);
  private _viewService = inject(PrivateViewPluginService);
  private _systemService = inject(SystemService);
  private _viewRegistry = inject(ViewRegistryService);
  private _executionTreeState = inject<TreeStateService<ReportNode, ReportTreeNode>>(TreeStateService);
  public _executionPanels = inject(SingleExecutionPanelsService);
  public _testCasesSelection = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);
  private _treeUtils = inject(ReportTreeNodeUtilsService);
  private _activeExecutions = inject(ActiveExecutionsService);
  private _executionTabManager = inject(ExecutionTabManagerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _terminator$ = new Subject<void>();
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  private isFirstUpdate = true;

  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;

  readonly Panels = Panels;

  tabs: Dashlet[] = [];
  activeTab?: Dashlet;

  execution?: Execution;
  testCases?: ReportNode[];
  showTestCaseCurrentOperation: boolean = true;
  keywordSearch?: string;

  progress?: ExecutionSummaryDto;
  testCasesProgress?: ExecutionSummaryDto;
  errorDistribution?: { errorCount: number; count: number };
  countByErrorMsg: ExecutionErrorMessageItem[] = [];
  countByErrorCode: ExecutionErrorCodeItem[] = [];
  currentOperations: Operation[] = [];
  selectedErrorDistributionToggle = ErrorDistributionStatus.MESSAGE;

  showAutoRefreshButton = false;

  readonly includedTestcases$: Observable<IncludeTestcases | undefined> = this._testCasesSelection.selected$.pipe(
    map((ids) => {
      const testCases = this.testCases || [];
      if (ids.length === testCases.length) {
        return undefined;
      }
      const by: IncludeTestcases['by'] =
        this.execution?.executionParameters?.repositoryObject?.repositoryID === 'local' ? 'id' : 'name';

      const list = testCases
        .filter((testCase) => ids.includes(testCase.id!) || ids.includes(testCase.artefactID!))
        .map(({ artefactID, name }) => (by === 'id' ? artefactID! : name!));

      return { by, list };
    })
  );

  readonly eId = this._activatedRoute.snapshot.url[0].path!;
  readonly activeExecution = this._activeExecutions.getActiveExecution(this.eId);
  protected activeTabId?: string = this._activatedRoute.snapshot.url?.[1]?.path;

  throughputchart: any | { series: any[]; data: any[][] } = {};

  showNodeInTree(nodeId: string): void {
    this._controllerService
      .getReportNodePath(nodeId)
      .pipe(
        tap(() => this.selectTab('tree')),
        map((nodes) => {
          nodes.shift();
          return nodes.map((node) => node.id!);
        }),
        switchMap((path) => {
          const finalNodeId = path[path.length - 1];
          return this._executionTreeState.expandNode(path).pipe(map(() => finalNodeId));
        })
      )
      .subscribe((nodeId) => this._executionTreeState.selectNodeById(nodeId));
  }

  showTestCase(nodeId: string): void {
    this._controllerService
      .getReportNodePath(nodeId)
      .pipe(
        map((nodes) => {
          const testCases = nodes.filter((node) => node.resolvedArtefact?._class === 'TestCase');
          return testCases[testCases.length - 1];
        }),
        filter((node) => !!node),
        tap((node) => {
          this._testCasesSelection.clear();
          if (node!.resolvedArtefact) {
            this._testCasesSelection.selectById(node!.resolvedArtefact.id!);
          }
        }),
        tap((node) => {
          this._executionPanels.enablePanel(Panels.TEST_CASES, true);
          this._executionPanels.setShowPanel(Panels.TEST_CASES, true);
        })
      )
      .subscribe(() => {
        this.selectTab('steps');
        this.scrollToPanel(Panels.TEST_CASES);
      });
  }

  ngOnInit(): void {
    this.initRefreshExecution();
    this.initTabs();
  }

  ngOnDestroy(): void {
    this._terminator$.next();
    this._terminator$.complete();
  }

  initRefreshExecution(): void {
    this._executionPanels.initialize(this.eId);
    this.activeExecution.execution$.pipe(takeUntil(this._terminator$)).subscribe((execution) => {
      this.execution = execution;
      this.showAutoRefreshButton = this.execution.status !== 'ENDED';
      this.handleExecutionRefresh({ updateSelection: this.isFirstUpdate ? UpdateSelection.ALL : UpdateSelection.NONE });
      this.refreshOther();
      if (this.isFirstUpdate) {
        this.loadExecutionTree();
      } else {
        this.refreshExecutionTree();
      }
      this.refreshTestCaseTable({
        updateSelection: this.isFirstUpdate ? UpdateSelection.ALL : UpdateSelection.ONLY_NEW,
      });
      this.isFirstUpdate = false;
    });
  }

  drillDownTestCase(id: string): void {
    this._testCasesSelection.clear();
    this._testCasesSelection.selectById(id);
    this._executionPanels.enablePanel(Panels.STEPS, true);
    this._executionPanels.setShowPanel(Panels.STEPS, true);
    this.scrollToPanel(Panels.STEPS);
  }

  searchStepByError(error: string): void {
    this.selectTab('steps');
    this.keywordSearch = escapeRegExp(error);
  }

  selectTab(tabId: string): void {
    this.activeTabId = tabId;
    this.activeTab = this.tabs.find((tab) => tab.id === tabId);
    const relativeTo = this._activatedRoute;
    const relativePath = this._activatedRoute.snapshot.url.length === 1 ? '.' : '..';
    this._router.navigate([relativePath, tabId], { relativeTo });
  }

  closeExecution(openList: boolean = true): void {
    const eId = this.eId!;
    this._executionTabManager.handleTabClose(eId, openList);
  }

  private initTabs(): void {
    this.tabs = this._viewRegistry
      .getDashlets('executionTabMigrated')
      .filter((dashlet) => !!dashlet?.isEnabledFct && dashlet.isEnabledFct());
    let tabToSelect = this.tabs[0]?.id;
    if (this.activeTabId) {
      let foundTab = this.tabs.find((tab) => tab.id === this.activeTabId);
      if (foundTab) {
        tabToSelect = foundTab.id;
      }
    }

    this.selectTab(tabToSelect);
  }

  private determineDefaultSelection(testCases?: ReportNode[]): void {
    testCases = testCases ?? this.testCases;
    if (!testCases || !this.execution) {
      return;
    }
    const selectedTestCases = testCases.filter((value) => {
      const artefactFilter = this.execution?.executionParameters?.artefactFilter;
      if (!artefactFilter) {
        return true;
      }
      switch (artefactFilter.class) {
        case 'step.artefacts.filters.TestCaseFilter':
          return (artefactFilter as any).includedNames.includes(value.name);
        case `step.artefacts.filters.TestCaseIdFilter`:
          return (artefactFilter as any).includedIds.includes(value.artefactID);
        default:
          return true;
      }
    });
    this._testCasesSelection.select(...selectedTestCases);
  }

  private prepareRefreshParams(params?: RefreshParams): RefreshParams {
    const eId = params?.eId ?? this.eId;
    const updateSelection = params?.updateSelection ?? UpdateSelection.ALL;
    return { eId, updateSelection };
  }

  private handleExecutionRefresh(params?: RefreshParams): void {
    const { updateSelection } = this.prepareRefreshParams(params);
    const execution = this.execution!;
    if (updateSelection !== UpdateSelection.NONE) {
      this.determineDefaultSelection();
    }
    const parameters: { key: string; value: string }[] = (execution.parameters as any) || [];
    const showTestCaseCurrentOperation = parameters.find(
      (o) => o.key === 'step.executionView.testcases.current-operations'
    );
    this.showTestCaseCurrentOperation = showTestCaseCurrentOperation?.value.toLowerCase() === 'true';
  }

  private loadExecutionTree(): void {
    if (!this.eId) {
      return;
    }
    this._treeUtils.loadNodes(this.eId).subscribe((nodes) => {
      if (nodes[0]) {
        this._executionTreeState.init(nodes[0], { expandAllByDefault: false });
      }
    });
  }

  private refreshExecutionTree(): void {
    if (!this.eId) {
      return;
    }
    const expandedNodIds = this._executionTreeState.getExpandedNodeIds();
    this._treeUtils
      .loadNodes(this.eId)
      .pipe(
        map((nodes) => nodes[0]),
        switchMap((rootNode) => {
          if (!rootNode) {
            return of(rootNode);
          }
          return this._treeUtils.restoreTree(rootNode, expandedNodIds);
        })
      )
      .subscribe((rootNode) => {
        if (rootNode) {
          this._executionTreeState.init(rootNode, { expandAllByDefault: false });
        }
      });
  }

  private refreshTestCaseTable(params?: RefreshParams): void {
    const { eId, updateSelection } = this.prepareRefreshParams(params);
    if (!eId) {
      return;
    }
    this._executionService
      .getReportNodesByExecutionId(eId, 'step.artefacts.reports.TestCaseReportNode', 500)
      .subscribe((reportNodes) => {
        if (reportNodes.length > 0) {
          if (reportNodes.length > 1 && !this._executionPanels.isPanelEnabled(Panels.TEST_CASES)) {
            this._executionPanels.setShowPanel(Panels.STEPS, false);
            this._executionPanels.setShowPanel(Panels.TEST_CASES, true);
          }
          this._executionPanels.enablePanel(Panels.TEST_CASES, true);
        }
        const oldTestCasesIds = (this.testCases ?? []).map((testCase) => testCase.id);
        const newTestCases = reportNodes.filter((testCase) => !oldTestCasesIds.includes(testCase.id));
        this.testCases = reportNodes;
        if (updateSelection !== UpdateSelection.NONE) {
          this.determineDefaultSelection(updateSelection === UpdateSelection.ONLY_NEW ? newTestCases : reportNodes);
        }
      });
  }

  private refreshOther(eId?: string): void {
    eId = eId || this.eId;
    if (!eId) {
      return;
    }

    this._viewService
      .getView('statusDistributionForFunctionCalls', eId)
      .subscribe((progress) => (this.progress = progress as ExecutionSummaryDto));

    this._viewService
      .getView('statusDistributionForTestcases', eId)
      .subscribe((testCasesProgress) => (this.testCasesProgress = testCasesProgress as ExecutionSummaryDto));

    this._viewService.getView('errorDistribution', eId).subscribe((errorDistribution) => {
      this.errorDistribution = errorDistribution as any as { errorCount: number; count: number };

      const countByErrorMsg: Record<string, number> = (this.errorDistribution as any).countByErrorMsg;
      this.countByErrorMsg = Object.entries(countByErrorMsg).map(([key, value]) => {
        key = key.replace(R_ERROR_KEY, (match, grp) => String.fromCharCode(parseInt(grp, 16)));
        key = decodeURIComponent(key);
        return { errorMessage: key!, errorCount: value };
      });

      const countByErrorCode: Record<string, number> = (this.errorDistribution as any).countByErrorCode;
      this.countByErrorCode = Object.entries(countByErrorCode).map(([key, value]) => ({
        errorCode: key,
        errorCodeCount: value,
      }));
    });

    this.selectedErrorDistributionToggle = ErrorDistributionStatus.MESSAGE;

    this._systemService.getCurrentOperations(eId).subscribe((operations) => {
      this.currentOperations = operations;
    });
  }

  private scrollToPanel(panel: Panels): void {
    const panelId = this._executionPanels.getPanelId(panel);
    const element = this._document.querySelector(`#${panelId}`);
    if (element) {
      element.scrollIntoView();
    }
  }
}
