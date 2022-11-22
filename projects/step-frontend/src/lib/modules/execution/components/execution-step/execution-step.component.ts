import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { downgradeComponent, getAngularJSGlobal } from '@angular/upgrade/static';
import { AJS_MODULE, Execution, ExecutionSummaryDto, Mutable, ReportNode, SelectionCollector } from '@exense/step-core';
import { ExecutionViewServices } from '../../../operations/shared/execution-view-services';
import { map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { Panels } from '../../shared/panels.enum';
import { SingleExecutionPanelsService } from '../../services/single-execution-panels.service';

type FieldAccessor = Mutable<Pick<ExecutionStepComponent, 'keywordParameters$'>>;

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnChanges, OnDestroy {
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

  readonly Panels = Panels;

  constructor(private panelService: SingleExecutionPanelsService) {}

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
    if (!this.parameters?.length || cExecution?.currentValue !== cExecution?.previousValue) {
      this.parameters = cExecution?.currentValue?.parameters;
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
        testcases: this.panelService.isPanelEnabled(Panels.testCases) ? testcases : undefined,
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
