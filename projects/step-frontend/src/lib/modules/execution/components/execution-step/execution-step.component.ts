import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ExecutionsPanelsService } from '../../services/executions-panels.service';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, ExecutionSummaryDto, Mutable, ReportNode, SelectionCollector } from '@exense/step-core';
import { ExecutionStepPanel } from '../../shared/execution-step-panel';
import { ExecutionViewServices } from '../../../operations/shared/execution-view-services';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { KeywordParameters } from '../../shared/keyword-parameters';

type FieldAccessor = Mutable<Pick<ExecutionStepComponent, 'keywordParameters$'>>;

const TYPE_LEAF_REPORT_NODES_TABLE_PARAMS = 'step.core.execution.LeafReportNodesTableParameters';

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnChanges, OnDestroy {
  private terminator$ = new Subject<any>();
  private selectionTerminator$?: Subject<any>;

  readonly keywordParameters$?: Observable<KeywordParameters>;

  @Input() eId: string = '';
  @Input() testCasesProgress?: ExecutionSummaryDto;
  @Input() progress?: ExecutionSummaryDto;
  @Input() execution?: Execution;
  @Input() executionViewServices?: ExecutionViewServices;
  @Input() showTestCaseCurrentOperation?: boolean;

  @Input() testCases?: ReportNode[];

  @Input() testCasesSelection?: SelectionCollector<string, ReportNode>;

  @Output() drilldownTestCase = new EventEmitter<string>();

  showAllOperations: boolean = false;

  parameters: { key: string; value: string }[] = [];

  readonly ID_TEST_CASES = 'testCases';
  readonly ID_STEPS = 'steps';
  readonly ID_PARAMETERS = 'parameters';

  panelTestCases?: ExecutionStepPanel;
  panelSteps?: ExecutionStepPanel;
  panelParameters?: ExecutionStepPanel;

  constructor(public _panelService: ExecutionsPanelsService) {}

  ngOnInit() {
    this._panelService.observePanel(this.ID_TEST_CASES, this.eId).subscribe((panel) => (this.panelTestCases = panel));
    this._panelService.observePanel(this.ID_STEPS, this.eId).subscribe((panel) => (this.panelSteps = panel));
    this._panelService.observePanel(this.ID_PARAMETERS, this.eId).subscribe((panel) => (this.panelParameters = panel));
  }

  chooseTestcase(testCase: ReportNode): void {
    this.drilldownTestCase.emit(testCase.artefactID);
  }

  selectAllTestCases(): void {
    this.testCasesSelection!.select(...this.testCases!);
  }

  unselectAllTestCases(): void {
    this.testCasesSelection!.clear();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cExecution = changes['execution'];
    if (cExecution?.currentValue !== cExecution?.previousValue) {
      const paramsObject: Record<string, string> = cExecution?.currentValue?.parameters || {};
      this.parameters = Object.entries(paramsObject).map(([key, value]) => ({ key, value }));
    }

    const cEid = changes['eId'];
    const cTestCasesSelection = changes['testCasesSelection'];

    let eid: string | undefined;
    let testCasesSelection: SelectionCollector<string, ReportNode> | undefined;

    if (cEid?.currentValue !== cEid?.previousValue || cEid?.firstChange) {
      eid = cEid?.currentValue;
    }

    if (cTestCasesSelection?.currentValue !== cTestCasesSelection?.previousValue || cTestCasesSelection?.firstChange) {
      testCasesSelection = cTestCasesSelection?.currentValue;
    }

    if (eid || testCasesSelection) {
      this.setupSelectionChanges(eid, testCasesSelection);
    }
  }

  ngOnDestroy(): void {
    this.terminateSelectionChanges();
    this.terminator$.next({});
    this.terminator$.complete();
  }

  private terminateSelectionChanges(): void {
    if (!this.selectionTerminator$) {
      return;
    }
    this.selectionTerminator$.next({});
    this.selectionTerminator$.complete();
    this.selectionTerminator$ = undefined;
  }

  private setupSelectionChanges(eid?: string, testCasesSelection?: SelectionCollector<string, ReportNode>): void {
    eid = eid || this.eId;
    testCasesSelection = testCasesSelection || this.testCasesSelection;
    this.terminateSelectionChanges();

    if (!testCasesSelection) {
      (this as FieldAccessor).keywordParameters$ = undefined;
      return;
    }

    this.selectionTerminator$ = new Subject<any>();

    (this as FieldAccessor).keywordParameters$ = testCasesSelection!.selected$.pipe(
      map((testcases) => ({
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid,
        testcases: this.panelTestCases?.enabled ? testcases : undefined,
      })),
      takeUntil(this.selectionTerminator$)
    );
  }

  handleShowNodeInTree(nodeId: string): void {
    if (!this.executionViewServices) {
      return;
    }
    this.executionViewServices.showNodeInTree(nodeId);
  }

  handleShowTestCase(nodeId: string): void {
    if (!this.executionViewServices) {
      return;
    }
    this.executionViewServices.showTestCase(nodeId);
  }
}

getAngularJSGlobal()
  .module(AJS_MODULE)
  .directive('stepExecutionStep', downgradeComponent({ component: ExecutionStepComponent }));
