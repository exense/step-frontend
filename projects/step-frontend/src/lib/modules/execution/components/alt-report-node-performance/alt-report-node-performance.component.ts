import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimeRange } from '@exense/step-core';
import { FilterBarItem, FilterBarItemType, StandaloneChartConfig } from '../../../timeseries/time-series.module';
import { TimeSeriesConfig } from '../../../timeseries/modules/_common';
import { Status } from '../../../_common/shared/status.enum';
import { AltExecutionStateService } from '../../services/alt-execution-state.service';
import { AggregatedTreeNode } from '../../shared/aggregated-tree-node';

interface NodePerformanceContext {
  timeRange: TimeRange;
  filters: FilterBarItem[];
}

@Component({
  selector: 'step-alt-report-node-performance',
  templateUrl: './alt-report-node-performance.component.html',
  styleUrl: './alt-report-node-performance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AltReportNodePerformanceComponent {
  private readonly _executionState = inject(AltExecutionStateService);
  private readonly executionId = toSignal(this._executionState.executionId$);
  private readonly timeRange = toSignal(this._executionState.timeRange$);

  readonly node = input.required<AggregatedTreeNode>();
  readonly selectedStatuses = input<Status[]>([]);
  readonly removeStatus = output<Status>();

  protected readonly metricKey = 'response-time';
  protected readonly grouping = ['name'];

  protected readonly context = computed<NodePerformanceContext | undefined>(() => {
    const node = this.node();
    const artefact = node.originalArtefact;
    const executionId = this.executionId();
    const artefactHash = node.artefactHash;
    const timeRange = this.timeRange();
    const selectedStatuses = this.selectedStatuses();
    const invocationCount = Object.values(node.countByStatus ?? {}).reduce((sum, count) => sum + count, 0);
    const instrumented = artefact?.instrumentNode;
    const hasMeasurements = artefact?._class === 'CallKeyword' || instrumented?.value || instrumented?.dynamic;

    if (
      !hasMeasurements ||
      invocationCount <= 1 ||
      !executionId ||
      !artefactHash ||
      !timeRange ||
      timeRange.from >= timeRange.to
    ) {
      return undefined;
    }

    const filters: FilterBarItem[] = [
      {
        attributeName: 'eId',
        label: 'Execution',
        isLocked: true,
        exactMatch: true,
        searchEntities: [{ searchValue: executionId }],
        type: FilterBarItemType.EXECUTION,
      },
      {
        attributeName: 'artefactHash',
        isLocked: true,
        exactMatch: true,
        freeTextValues: [JSON.stringify(artefactHash)],
        searchEntities: [],
        type: FilterBarItemType.FREE_TEXT,
      },
    ];
    if (selectedStatuses.length) {
      filters.push({
        attributeName: TimeSeriesConfig.STATUS_ATTRIBUTE,
        isLocked: true,
        exactMatch: true,
        freeTextValues: selectedStatuses.map((status) => JSON.stringify(status)),
        searchEntities: [],
        type: FilterBarItemType.FREE_TEXT,
      });
    }

    return { timeRange, filters };
  });

  protected readonly responseTimesConfig: StandaloneChartConfig = {
    title: 'Response Times',
    height: 240,
    zoomEnabled: true,
    showTooltip: true,
    showLegend: true,
    showYAxes: true,
    showTimeAxes: true,
    showCursor: true,
    nullMeansZero: false,
    primaryAxes: {
      aggregation: { type: 'AVG' },
      displayType: 'LINE',
      unit: 'ms',
      colorizationType: 'STROKE',
    },
    secondaryAxes: null,
  };

  protected readonly throughputConfig: StandaloneChartConfig = {
    title: 'Throughput',
    height: 240,
    zoomEnabled: true,
    showTooltip: true,
    showLegend: true,
    showYAxes: true,
    showTimeAxes: true,
    showCursor: true,
    tooltipYAxesUnit: 'Total Hits/h',
    primaryAxes: {
      aggregation: {
        type: 'RATE',
        params: { rateUnit: 'h' },
      },
      displayType: 'LINE',
      colorizationType: 'STROKE',
    },
    secondaryAxes: {
      aggregation: {
        type: 'RATE',
        params: { rateUnit: 'h' },
      },
      displayType: 'BAR_CHART',
      colorizationType: 'STROKE',
    },
  };
}
