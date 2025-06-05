import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DateFormat, Measure, ReportNode, TableLocalDataSource } from '@exense/step-core';
import { ReportNodeType } from '../../shared/report-node-type.enum';
import { ExecutionStateService } from '../../../execution/services/execution-state.service';
import { AltExecutionStateService } from '../../../execution/services/alt-execution-state.service';
import { of } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'step-call-function-report-node',
  templateUrl: './call-function-report-node.component.html',
  styleUrls: ['./call-function-report-node.component.scss'],
  standalone: false,
})
export class CallFunctionReportNodeComponent implements OnChanges {
  private _executionState = inject(ExecutionStateService, { optional: true });
  private _altExecutionState = inject(AltExecutionStateService, { optional: true });
  private _window = inject(DOCUMENT).defaultView!;

  private execution$ = this._altExecutionState
    ? this._altExecutionState.execution$
    : of(this._executionState?.execution);

  protected readonly execution = toSignal(this.execution$.pipe(takeUntilDestroyed()), { initialValue: undefined });

  readonly DateFormat = DateFormat;

  @Input() node!: ReportNode | any | { measures: Measure[] };
  @Input() children!: ReportNode[];

  protected measuresDataSource?: TableLocalDataSource<Measure>;

  displayChildren: ReportNode[] = [];

  @Input() hideMeasures: boolean = false;
  @Input() hideRouting: boolean = true;

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

  navigateToAnalyticsView(measure: Measure): void {
    const execution = this.execution();
    if (!execution) {
      return;
    }
    const start = execution.startTime!;
    const executionInProgress = !execution.endTime;
    const params: Record<string, string> = {
      dc_rangeType: 'ABSOLUTE',
      dc_q_eId: execution.id!,
      dc_q_name: measure.name!,
      dc_from: start!.toString(),
      dc_refreshInterval: executionInProgress ? '1' : '0',
    };
    if (!executionInProgress) {
      params['dc_to'] = execution.endTime!.toString();
    }
    const paramsString = new URLSearchParams(params).toString();
    const url = `/#/analytics?${paramsString}`;
    this._window.open(url, '_blank');
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
