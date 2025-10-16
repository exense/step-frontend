import { Component, DestroyRef, forwardRef, inject, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import {
  AlertType,
  AugmentedExecutionsService,
  BulkSelectionType,
  ControllerService,
  Dashlet,
  EntityRefService,
  entitySelectionStateProvider,
  EntitySelectionStateUpdatable,
  Execution,
  ExecutionCloseHandleService,
  ExecutionSummaryDto,
  ExecutiontTaskParameters,
  IncludeTestcases,
  IS_SMALL_SCREEN,
  Operation,
  PrivateViewPluginService,
  ReloadableDirective,
  ReportNode,
  ScheduledTaskTemporaryStorageService,
  SelectionList,
  SystemService,
  TableDataSource,
  TableLocalDataSource,
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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ReportNodeExt } from '../../shared/report-node-ext';

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
    {
      provide: EntityRefService,
      useExisting: forwardRef(() => ExecutionProgressComponent),
    },
    SingleExecutionPanelsService,
    ExecutionTreePagingService,
    ...entitySelectionStateProvider('artefactID'),
    TreeStateService,
  ],
  hostDirectives: [ReloadableDirective],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class ExecutionProgressComponent
  implements OnInit, ExecutionStateService, ExecutionCloseHandleService, OnDestroy, EntityRefService<Execution>
{
  private _document = inject(DOCUMENT);
  private _executionService = inject(AugmentedExecutionsService);
  private _controllerService = inject(ControllerService);
  private _viewService = inject(PrivateViewPluginService);
  private _systemService = inject(SystemService);
  private _viewRegistry = inject(ViewRegistryService);
  private _executionTreeState = inject<TreeStateService<ReportNode, ReportTreeNode>>(TreeStateService);
  public _executionPanels = inject(SingleExecutionPanelsService);
  private _testCasesSelectionState =
    inject<EntitySelectionStateUpdatable<string, ReportNode>>(EntitySelectionStateUpdatable);
  private _treeUtils = inject(ReportTreeNodeUtilsService);
  private _activeExecutions = inject(ActiveExecutionsService);
  private _executionTabManager = inject(ExecutionTabManagerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _router = inject(Router);
  private _destroyRef = inject(DestroyRef);
  private _currentExecutionTerminator$?: Subject<void>;
  private _scheduledTaskTemporaryStorage = inject(ScheduledTaskTemporaryStorageService);
  readonly _isSmallScreen$ = inject(IS_SMALL_SCREEN);

  private isFirstUpdate = true;
  private isTreeInitialized = false;

  readonly Panels = Panels;
  readonly AlertType = AlertType;

  tabs: Dashlet[] = [];
  activeTab?: Dashlet;

  private executionInternal = signal<Execution | undefined>(undefined);
  execution?: Execution;
  testCases?: ReportNode[];
  selectedTestCases?: ReportNode[];
  testCasesDataSource?: TableDataSource<ReportNode>;
  keywordSearch?: string;

  readonly _executionMessages = inject(ViewRegistryService).getDashlets('execution/messages');

  progress?: ExecutionSummaryDto;
  testCasesProgress?: ExecutionSummaryDto;
  errorDistribution?: { errorCount: number; count: number };
  countByErrorMsg: ExecutionErrorMessageItem[] = [];
  countByErrorCode: ExecutionErrorCodeItem[] = [];
  currentOperations: Operation[] = [];
  selectedErrorDistributionToggle = ErrorDistributionStatus.MESSAGE;

  showAutoRefreshButton = false;

  private selectionList?: SelectionList<string, ReportNode>;

  private selected$ = toObservable(this._testCasesSelectionState.selectedKeys).pipe(
    map((selectedKeys) => Array.from(selectedKeys)),
  );

  setupTableSelectionList(list?: SelectionList<string, ReportNode>): void {
    this.selectionList = list;
  }

  readonly currentEntity = this.executionInternal.asReadonly();

  readonly includedTestcases$: Observable<IncludeTestcases | undefined> = this.selected$.pipe(
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

  showNodeInTree(nodeId: string): void {
    this._treeUtils
      .getPathToNode(nodeId)
      .pipe(
        tap(() => this.selectTab('tree')),
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
          if (node!.resolvedArtefact) {
            this._testCasesSelectionState.updateSelection({
              keys: [node!.resolvedArtefact.id!],
              selectionType: BulkSelectionType.INDIVIDUAL,
            });
          } else {
            this._testCasesSelectionState.updateSelection({ keys: [], selectionType: BulkSelectionType.NONE });
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
    this.initSubTabChangeByRouting();
  }

  ngOnDestroy(): void {
    this.terminateCurrentExecutionChanges();
  }

  drillDownTestCase(id: string): void {
    this._testCasesSelectionState.updateSelection({ keys: [id], selectionType: BulkSelectionType.INDIVIDUAL });
    this._executionPanels.enablePanel(Panels.STEPS, true);
    this._executionPanels.setShowPanel(Panels.STEPS, true);
    this.scrollToPanel(Panels.STEPS);
  }

  searchStepByError(error: string): void {
    this.selectTab('steps');
    this.keywordSearch = escapeRegExp(error);
  }

  selectTab(tabId: string, isInitialize?: boolean): void {
    this.activeTabId = tabId;
    this.activeTab = this.tabs.find((tab) => tab.id === tabId);
    const routeUrl = this._activatedRoute.snapshot.url;
    const currentPath = routeUrl[routeUrl.length - 1].path;
    if (currentPath === tabId) {
      return;
    }
    const relativePath = routeUrl.length === 1 ? '.' : '..';
    const relativeTo = this._activatedRoute;
    this._router.navigate([relativePath, tabId], { relativeTo, replaceUrl: isInitialize });
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
      takeUntilDestroyed(this._destroyRef),
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

  private initSubTabChangeByRouting(): void {
    const subTab$ = this._activatedRoute.url.pipe(
      filter(() => !!this.tabs?.length),
      map((url) => url[url.length - 1].path),
      distinctUntilChanged(),
      filter((subPath) => {
        const allowedTabs = this.tabs.map((tab) => tab.id);
        return allowedTabs.includes(subPath) && subPath !== this.activeTabId;
      }),
      takeUntilDestroyed(this._destroyRef),
    );

    subTab$.subscribe((tab) => this.selectTab(tab));
  }

  private initRefreshExecution(): void {
    this._executionPanels.initialize(this.executionId!);
    this.activeExecution!.execution$.pipe(takeUntil(this._currentExecutionTerminator$!)).subscribe((execution) => {
      this.executionInternal.set(execution);
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

    this.selectTab(tabToSelect, true);
  }

  private determineDefaultSelection(testCases?: ReportNode[]): void {
    testCases = testCases ?? this.testCases;
    if (!testCases || testCases.length === 0 || !this.execution) {
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

    this.testCases = this.mergeReportNodes(this.testCases || [], testCases || []);
    this.selectedTestCases = this.mergeReportNodes(this.selectedTestCases || [], selectedTestCases || []);

    setTimeout(() => {
      if (this.selectedTestCases?.length === this.testCases?.length) {
        this.selectionList?.selectAll?.();
      } else {
        const ids = !!this.selectedTestCases ? (this.selectedTestCases.map((item) => item.artefactID) as string[]) : [];
        this.selectionList?.selectIds?.(ids);
      }
    }, 250);
  }

  private mergeReportNodes(testcases1: ReportNode[], testcases2: ReportNode[]): ReportNode[] {
    const existingIds = new Set(testcases1.map((node) => node.artefactID));
    const merged = [...testcases1];

    for (const node of testcases2) {
      if (!node.artefactID || !existingIds.has(node.artefactID)) {
        merged.push(node);
        if (node.artefactID) {
          existingIds.add(node.artefactID);
        }
      }
    }

    return merged;
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
        this.setupTestCasesDataSource(reportNodes);
        if (updateSelection !== UpdateSelection.NONE) {
          const testCases = updateSelection === UpdateSelection.ONLY_NEW ? newTestCases : reportNodes;
          this.determineDefaultSelection(testCases);
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

  private setupTestCasesDataSource(testCases?: ReportNode[]): void {
    testCases = (testCases ?? []).map(
      (item) =>
        ({
          ...item,
          idObjectValue: new String(item.id),
        }) as ReportNodeExt,
    );
    this.testCasesDataSource = new TableLocalDataSource<ReportNode>(
      testCases,
      TableLocalDataSource.configBuilder<ReportNode>()
        .addSearchStringRegexPredicate('status', (item) => item.status)
        .build(),
    );
    if (testCases.length > 0 && testCases.length === this._testCasesSelectionState.selectedSize()) {
      const isAllIncluded = testCases.reduce(
        (result, testCase) => result && this._testCasesSelectionState.isSelected(testCase),
        true,
      );
      if (isAllIncluded) {
        this.selectionList?.selectAll?.();
      }
    }
  }
}
