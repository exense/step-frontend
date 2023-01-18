import {
  Component,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import {
  AJS_MODULE,
  AugmentedExecutionsService,
  AutoDeselectStrategy,
  ControllerService,
  Dashlet,
  Execution,
  ExecutionCloseHandleService,
  ExecutionSummaryDto,
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
import { filter, map, Observable, switchMap, tap } from 'rxjs';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { Panels } from '../../shared/panels.enum';
import { ReportTreeNode } from '../../shared/report-tree-node';
import { ReportTreeNodeUtilsService } from '../../services/report-tree-node-utils.service';
import { EXECUTION_TREE_PAGING } from '../../services/execution-tree-paging';
import { DOCUMENT } from '@angular/common';

const R_ERROR_KEY = /\\\\u([\d\w]{4})/gi;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

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
    selectionCollectionProvider('artefactID', AutoDeselectStrategy.KEEP_SELECTION),
    TreeStateService,
  ],
})
export class ExecutionProgressComponent
  implements OnInit, OnChanges, ExecutionStateService, ExecutionCloseHandleService
{
  readonly trackByItemInfo: TrackByFunction<ItemInfo> = (index, item) => item.type;

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
  selectedErrorDistributionToggle = ErrorDistributionStatus.message;

  autoRefreshDisabled: boolean = true;
  autoRefreshInterval: number = 0;
  autoRefreshIncreasedTo: number = 0;

  readonly includedTestcases$: Observable<{ by: 'id' | 'name'; list: string[] } | null> =
    this._testCasesSelection.selected$.pipe(
      map((ids) => {
        const testCases = this.testCases || [];
        if (ids.length === testCases.length) {
          return null;
        }
        const by = this.execution?.executionParameters?.repositoryObject?.repositoryID === 'local' ? 'id' : 'name';

        const list = testCases
          .filter((testCase) => ids.includes(testCase.id!))
          .map(({ artefactID, name }) => (by === 'id' ? artefactID! : name!));

        return { list, by };
      })
    );

  @Input() eId?: string;
  @Input() isActive?: boolean;
  @Input() activeTabId?: string;
  @Output() activeTabIdChange = new EventEmitter<string>();
  @Output() titleUpdate = new EventEmitter<{ eId: string; execution: Execution }>();
  @Output() close = new EventEmitter<string>();

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _executionService: AugmentedExecutionsService,
    private _controllerService: ControllerService,
    private _viewService: PrivateViewPluginService,
    private _systemService: SystemService,
    private _viewRegistry: ViewRegistryService,
    private _executionTreeState: TreeStateService<ReportNode, ReportTreeNode>,
    public _executionPanels: SingleExecutionPanelsService,
    public _testCasesSelection: SelectionCollector<string, ReportNode>
  ) {}

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
          this._testCasesSelection.selectById(node!.resolvedArtefact!.id!);
        }),
        tap((node) => {
          this._executionPanels.enablePanel(Panels.testCases, true);
          this._executionPanels.setShowPanel(Panels.testCases, true);
        })
      )
      .subscribe(() => {
        this.selectTab('steps');
        this.scrollToPanel(Panels.testCases);
      });
  }

  getExecution(): Execution {
    return this.execution!;
  }

  ngOnInit(): void {
    this.initTabs();
  }

  refresh(): void {
    if (this.autoRefreshDisabled) {
      return;
    }
    this.refreshExecution();
    if (!this.execution || this.execution.status !== 'ENDED') {
      if (this.isActive) {
        this.refreshOther();
        this.refreshTestCaseTable();
      }
    } else {
      this.autoRefreshDisabled = true;
      this.refreshOther();
      this.refreshTestCaseTable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cEid = changes['eId'];
    if (cEid?.previousValue !== cEid?.currentValue || cEid?.firstChange) {
      this._executionPanels.initialize(cEid?.currentValue);
      this.refreshExecution(cEid?.currentValue);
      this.refreshOther(cEid?.currentValue);
      this.refreshTestCaseTable(cEid?.currentValue);
    }
  }

  drillDownTestCase(id: string): void {
    this._testCasesSelection.clear();
    this._testCasesSelection.selectById(id);
    this._executionPanels.enablePanel(Panels.steps, true);
    this.scrollToPanel(Panels.steps);
  }

  searchStepByError(error: string): void {
    this.selectTab('steps');
    this.keywordSearch = escapeRegExp(error);
  }

  selectTab(tabId: string): void {
    this.activeTabId = tabId;
    this.activeTab = this.tabs.find((tab) => tab.id === tabId);
    this.activeTabIdChange.emit(tabId);
  }

  closeExecution(): void {
    this.close.emit(this.eId!);
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

  private determineDefaultSelection(): void {
    if (!this.testCases || !this.execution) {
      return;
    }
    const selectedTestCases = this.testCases.filter((value) => {
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

  private refreshExecution(eId?: string): void {
    eId = eId || this.eId;
    if (!eId) {
      return;
    }
    this._executionService.getExecutionById(eId).subscribe((execution) => {
      this.onExecutionStatusUpdate(execution?.status);
      this.execution = execution;
      this.determineDefaultSelection();
      const showTestCaseCurrentOperation = (execution.parameters as any as { key: string; value: string }[]).find(
        (o) => o.key === 'step.executionView.testcases.current-operations'
      );
      this.showTestCaseCurrentOperation = showTestCaseCurrentOperation?.value.toLowerCase() === 'true';
      this.titleUpdate.emit({ eId: eId!, execution });
    });
  }

  private refreshTestCaseTable(eId?: string): void {
    eId = eId || this.eId;
    if (!eId) {
      return;
    }
    this._executionService
      .getReportNodesByExecutionId(eId, 'step.artefacts.reports.TestCaseReportNode', 500)
      .subscribe((reportNodes) => {
        if (reportNodes.length > 0) {
          if (reportNodes.length > 1 && !this._executionPanels.isPanelEnabled(Panels.testCases)) {
            this._executionPanels.setShowPanel(Panels.steps, false);
            this._executionPanels.setShowPanel(Panels.testCases, true);
          }
          this._executionPanels.enablePanel(Panels.testCases, true);
        }
        this.testCases = reportNodes;
        this.determineDefaultSelection();
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

    this.selectedErrorDistributionToggle = ErrorDistributionStatus.message;

    //todo charts

    this._systemService.getCurrentOperations(eId).subscribe((operations) => {
      this.currentOperations = operations;
    });
  }

  private onExecutionStatusUpdate(status?: string): void {
    if (!status) {
      return;
    }
    if (status === 'ENDED') {
      this.refresh();
      this.autoRefreshDisabled = true;
      this.autoRefreshInterval = 0;
      this.autoRefreshIncreasedTo = 0;
    } else {
      this.autoRefreshDisabled = false;
      this.autoRefreshInterval = 100;
      this.autoRefreshIncreasedTo = 5000;
    }
  }

  private scrollToPanel(panel: Panels): void {
    const panelId = this._executionPanels.getPanelId(panel);
    const element = this._document.querySelector(`#${panelId}`);
    if (element) {
      element.scrollIntoView();
    }
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionProgress', downgradeComponent({ component: ExecutionProgressComponent }));
