import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateFormat, Execution, Measure, ReportNode, TableLocalDataSource } from '@exense/step-core';
import { ReportNodeType } from '../../shared/report-node-type.enum';
import { ExecutionStateService } from '../../../execution/services/execution-state.service';

@Component({
  selector: 'step-call-function-report-node',
  templateUrl: './call-function-report-node.component.html',
  styleUrls: ['./call-function-report-node.component.scss'],
})
export class CallFunctionReportNodeComponent implements OnChanges {
  readonly DateFormat = DateFormat;

  @Input() node!: ReportNode | any | { measures: Measure[] };
  @Input() children!: ReportNode[];

  protected measuresDataSource?: TableLocalDataSource<Measure>;

  displayChildren: ReportNode[] = [];

  hideMeasures: boolean = false;
  hideRouting: boolean = true;

  execution: Execution = inject(ExecutionStateService).execution!;

  ngOnChanges(changes: SimpleChanges): void {
    const cChildren = changes['children'];
    if (cChildren?.previousValue !== cChildren?.currentValue || cChildren?.firstChange) {
      this.filterChildren(cChildren?.currentValue);
    }

    const cNode = changes['node'];
    if (cNode?.previousValue !== cNode?.currentValue || cNode?.firstChange) {
      this.setupMeasuresDataSource(cNode.currentValue.measures);
    }
  }

  navigateToAnalyticsView(measure: Measure) {
    const start = this.execution.startTime;
    const executionInProgress = !this.execution.endTime;
    const params: any = {
      executionId: this.execution.id,
      name: measure.name,
      start: start,
      refresh: executionInProgress ? '1' : '0',
      tsParams: 'eId,name,start,end,refresh',
    };
    if (!executionInProgress) {
      params.end = this.execution.endTime;
    }
    let paramsString = new URLSearchParams(params).toString();
    const url = `/#/analytics?${paramsString}`;
    window.open(url, '_blank');
  }

  private filterChildren(children?: ReportNode[]): void {
    this.displayChildren = (children || []).filter((child) =>
      ([ReportNodeType.ASSERT_REPORT_NODE, ReportNodeType.PERFORMANCE_ASSERT_REPORT_NODE] as string[]).includes(
        child._class,
      ),
    );
  }

  private setupMeasuresDataSource(measures?: Measure[]): void {
    this.measuresDataSource = new TableLocalDataSource<Measure>(
      measures ?? [],
      TableLocalDataSource.configBuilder<Measure>()
        .addSortNumberPredicate('duration', (item: Measure) => item.duration)
        .build(),
    );
  }
}
