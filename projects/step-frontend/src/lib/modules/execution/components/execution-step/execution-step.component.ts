import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BulkSelectionType,
  Execution,
  ExecutionSummaryDto,
  ReportNode,
  SelectionCollector,
  TableLocalDataSource,
} from '@exense/step-core';
import { ExecutionViewServices } from '../../../operations/shared/execution-view-services';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { KeywordParameters } from '../../shared/keyword-parameters';
import { TYPE_LEAF_REPORT_NODES_TABLE_PARAMS } from '../../shared/type-leaf-report-nodes-table-params';
import { Panels } from '../../shared/panels.enum';
import { SingleExecutionPanelsService } from '../../services/single-execution-panels.service';
import { MatSort, Sort } from '@angular/material/sort';
import { REPORT_NODE_STATUS } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-execution-step',
  templateUrl: './execution-step.component.html',
  styleUrls: ['./execution-step.component.scss'],
})
export class ExecutionStepComponent implements OnChanges, OnDestroy {
  private panelService = inject(SingleExecutionPanelsService);
  private _testCasesSelection = inject<SelectionCollector<string, ReportNode>>(SelectionCollector);

  private selectionTerminator$?: Subject<void>;

  protected keywordParameters$?: Observable<KeywordParameters>;
  readonly statusOptions = REPORT_NODE_STATUS;

  selectionType: BulkSelectionType = BulkSelectionType.NONE;

  @Input() eId: string = '';
  @Input() testCasesProgress?: ExecutionSummaryDto;
  @Input() progress?: ExecutionSummaryDto;
  @Input() execution?: Execution;
  @Input() executionViewServices?: ExecutionViewServices;
  @Input() showTestCaseCurrentOperation?: boolean;
  @Input() keywordSearch?: string;

  @Input() testCases?: ReportNode[];

  @Output() drilldownTestCase = new EventEmitter<string>();

  @ViewChild('testCaseSort') testCaseSort!: MatSort;

  showAllOperations: boolean = false;

  parameters: { key: string; value: string }[] = [];

  readonly Panels = Panels;

  protected testCasesDataSource?: TableLocalDataSource<ReportNode>;

  handleTestCaseSort(sort: Sort): void {
    if (sort.active === 'name' && sort.direction === '') {
      // Reset to default sort
      Promise.resolve().then(() => {
        // To apply properly, the default sort needs to be run after the original sort will be applied
        // that is why it is places in async operation
        this.testCaseSort.sort({ id: '', start: '', disableClear: false });
      });
    }
  }

  chooseTestcase(testCase: ReportNode): void {
    this.drilldownTestCase.emit(testCase.artefactID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cExecution = changes['execution'];
    if (!this.parameters?.length || cExecution?.currentValue !== cExecution?.previousValue) {
      this.parameters = cExecution?.currentValue?.parameters;
    }

    const cEid = changes['eId'];
    if (cEid?.currentValue !== cEid?.previousValue || cEid?.firstChange) {
      this.setupSelectionChanges(cEid?.currentValue);
    }

    const cTestCases = changes['testCases'];
    if (cTestCases?.previousValue !== cTestCases?.currentValue || cTestCases?.firstChange) {
      this.setupTestCasesDataSource(cTestCases?.currentValue);
      this.determineSelectionType(cTestCases?.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.terminateSelectionChanges();
  }

  private terminateSelectionChanges(): void {
    if (!this.selectionTerminator$) {
      return;
    }
    this.selectionTerminator$.next();
    this.selectionTerminator$.complete();
    this.selectionTerminator$ = undefined;
  }

  private setupSelectionChanges(eid?: string): void {
    eid = eid || this.eId;
    this.terminateSelectionChanges();

    this.selectionTerminator$ = new Subject<void>();

    this.keywordParameters$ = this._testCasesSelection!.selected$.pipe(
      map((testcases) => ({
        type: TYPE_LEAF_REPORT_NODES_TABLE_PARAMS,
        eid,
        testcases: this.panelService.isPanelEnabled(Panels.TEST_CASES) ? testcases : undefined,
      })),
      takeUntil(this.selectionTerminator$)
    );

    this._testCasesSelection!.selected$.pipe(takeUntil(this.selectionTerminator$)).subscribe((selected) =>
      this.determineSelectionType(undefined, selected)
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

  private setupTestCasesDataSource(testCases?: ReportNode[]): void {
    this.testCasesDataSource = new TableLocalDataSource<ReportNode>(
      testCases ?? [],
      TableLocalDataSource.configBuilder<ReportNode>()
        .addSearchStringRegexPredicate('status', (item) => item.status)
        .build()
    );
  }

  private determineSelectionType(testCases?: ReportNode[], selected?: readonly string[]): void {
    testCases = testCases ?? this.testCases ?? [];
    selected = selected ?? this._testCasesSelection.selected ?? [];
    if (testCases.length > 0 && testCases.length === selected.length) {
      const isAllIncluded = testCases.reduce(
        (result, testCase) => result && selected!.includes(testCase.artefactID!),
        true
      );
      if (isAllIncluded) {
        this.selectionType = BulkSelectionType.ALL;
      }
    }
  }
}
