import { Component, forwardRef, inject, Inject, OnDestroy, OnInit, TrackByFunction } from '@angular/core';
import {
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  ControllerService,
  Dashlet,
  Execution,
  ExecutionCloseHandleService,
  ExecutionSummaryDto,
  ExecutiontTaskParameters,
  IncludeTestcases,
  IS_SMALL_SCREEN,
  ItemInfo,
  Operation,
  PrivateViewPluginService,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
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
import { distinctUntilChanged, filter, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { Panels } from '../../shared/panels.enum';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { ReportTreeNodeUtilsService } from '../../services/report-tree-node-utils.service';
import {
  EXECUTION_TREE_PAGING_SETTINGS,
  ExecutionTreePagingService,
} from '../../services/execution-tree-paging.service';
import { DOCUMENT } from '@angular/common';
import { ExecutionTabManagerService } from '../../services/execution-tab-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveExecution, ActiveExecutionsService } from '../../services/active-executions.service';

const R_ERROR_KEY = /\\\\u([\d\w]{4})/gi;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

enum UpdateSelection {
  ALL = 'all',
  ONLY_NEW = 'onlyNew',
  NONE = 'none',
}

interface RefreshParams {
  executionId?: string;
  updateSelection?: UpdateSelection;
}

@Component({
  selector: 'step-execution-progress',
  templateUrl: './execution-progress.component.html',
  styleUrls: ['./execution-progress.component.scss'],
  providers: [
    {
      provide: EXECUTION_TREE_PAGING_SETTINGS,
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
    ExecutionTreePagingService,
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
  private _currentExecutionTerminator$?: Subject<void>;
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  private isFirstUpdate = true;
  private isTreeInitialized = false;

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
    }),
  );

  executionId?: string;
  activeExecution?: ActiveExecution;
  protected activeTabId?: string;

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
        }),
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
        }),
      )
      .subscribe(() => {
        this.selectTab('steps');
        this.scrollToPanel(Panels.TEST_CASES);
      });
  }

  ngOnInit(): void {
    this.initExecutionChangeByRouting();
  }

  ngOnDestroy(): void {
    this.terminateCurrentExecutionChanges();
    this._terminator$.next();
    this._terminator$.complete();
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
    const routeUrl = this._activatedRoute.snapshot.url;
    const currentPath = routeUrl[routeUrl.length - 1].path;
    if (currentPath === tabId) {
      return;
    }
    const relativePath = routeUrl.length === 1 ? '.' : '..';
    const relativeTo = this._activatedRoute;
    this._router.navigate([relativePath, tabId], { relativeTo });
  }

  closeExecution(openList: boolean = true): void {
    const executionId = this.executionId!;
    this._executionTabManager.handleTabClose(executionId, openList);
  }

  handleTaskSchedule(task: ExecutiontTaskParameters): void {
    const temporaryId = this._scheduledTaskTemporaryStorage.set(task);
    this._router.navigate([{ outlets: { modal: ['schedule', temporaryId] } }], { relativeTo: this._activatedRoute });
  }

  private terminateCurrentExecutionChanges(): void {
    this._currentExecutionTerminator$?.next();
    this._currentExecutionTerminator$?.complete();
    this._currentExecutionTerminator$ = undefined;
  }

  private initExecutionChangeByRouting(): void {
    const executionId$ = this._activatedRoute.url.pipe(
      map((url) => url[0].path),
      distinctUntilChanged(),
      takeUntil(this._terminator$),
    );

    executionId$.subscribe((executionId) => {
      this.terminateCurrentExecutionChanges();
      this._currentExecutionTerminator$ = new Subject<void>();
      this.executionId = executionId;
      this.activeExecution = this._activeExecutions.getActiveExecution(executionId);
      this.activeTabId = this._activatedRoute.snapshot.url?.[1]?.path;
      this.initRefreshExecution();
      this.initTabs();
    });
  }

  private initRefreshExecution(): void {
    this._executionPanels.initialize(this.executionId!);
    this.activeExecution!.execution$.pipe(takeUntil(this._currentExecutionTerminator$!)).subscribe((execution) => {
      this.execution = execution;
      const isExecutionCompleted = execution.status === 'ENDED';
      this.showAutoRefreshButton = !isExecutionCompleted;
      this.handleExecutionRefresh({ updateSelection: this.isFirstUpdate ? UpdateSelection.ALL : UpdateSelection.NONE });
      this.refreshOther();
      if (this.isFirstUpdate) {
        this.loadExecutionTree();
      } else {
        this.refreshExecutionTree(isExecutionCompleted);
      }
      this.refreshTestCaseTable({
        updateSelection: this.isFirstUpdate ? UpdateSelection.ALL : UpdateSelection.ONLY_NEW,
      });
      this.isFirstUpdate = false;
    });
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
    const executionId = params?.executionId ?? this.executionId;
    const updateSelection = params?.updateSelection ?? UpdateSelection.ALL;
    return { executionId, updateSelection };
  }

  private handleExecutionRefresh(params?: RefreshParams): void {
    const { updateSelection } = this.prepareRefreshParams(params);
    const execution = this.execution!;
    if (updateSelection !== UpdateSelection.NONE) {
      this.determineDefaultSelection();
    }
    const parameters: { key: string; value: string }[] = (execution.parameters as any) || [];
    const showTestCaseCurrentOperation = parameters.find(
      (o) => o.key === 'step.executionView.testcases.current-operations',
    );
    this.showTestCaseCurrentOperation = showTestCaseCurrentOperation?.value.toLowerCase() === 'true';
  }

  private loadExecutionTree(): void {
    if (!this.executionId) {
      return;
    }
    this._treeUtils.loadNodes(this.executionId).subscribe((nodes) => {
      if (nodes[0]) {
        this._executionTreeState.init(nodes[0], { expandAllByDefault: false });
        this.isTreeInitialized = true;
      }
    });
  }

  private refreshExecutionTree(isForceRefresh?: boolean): void {
    if (!this.executionId) {
      return;
    }
    const expandedNodIds = this._executionTreeState.getExpandedNodeIds();
    this._treeUtils
      .loadNodes(this.executionId)
      .pipe(
        map((nodes) => nodes[0]),
        switchMap((rootNode) => {
          if (!rootNode || !this.isTreeInitialized || isForceRefresh) {
            return of(rootNode);
          }
          return this._treeUtils.restoreTree(rootNode, expandedNodIds);
        }),
      )
      .subscribe((rootNode) => {
        if (rootNode) {
          this._executionTreeState.init(rootNode, { expandAllByDefault: false });
          this.isTreeInitialized = true;
        }
      });
  }

  private refreshTestCaseTable(params?: RefreshParams): void {
    const { executionId, updateSelection } = this.prepareRefreshParams(params);
    if (!executionId) {
      return;
    }
    this._executionService
      .getReportNodesByExecutionId(executionId, 'step.artefacts.reports.TestCaseReportNode', 500)
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

  private refreshOther(executionId?: string): void {
    executionId = executionId || this.executionId;
    if (!executionId) {
      return;
    }

    this._viewService
      .getView('statusDistributionForFunctionCalls', executionId)
      .subscribe((progress) => (this.progress = progress as ExecutionSummaryDto));

    this._viewService
      .getView('statusDistributionForTestcases', executionId)
      .subscribe((testCasesProgress) => (this.testCasesProgress = testCasesProgress as ExecutionSummaryDto));

    this._viewService.getView('errorDistribution', executionId).subscribe((errorDistribution) => {
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

    this._systemService.getCurrentOperations(executionId).subscribe((operations) => {
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
