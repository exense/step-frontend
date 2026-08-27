import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReportNode, TimeRange } from '@exense/step-core';
import { FilterBarItem, FilterBarItemType, StandaloneChartConfig } from '../../../timeseries/time-series.module';

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
  readonly node = input.required<ReportNode>();

  protected readonly metricKey = 'response-time';
  protected readonly grouping = ['name'];

  protected readonly context = computed<NodePerformanceContext | undefined>(() => {
    const node = this.node();
    const resolvedArtefact = node.resolvedArtefact;
    const executionId = node.executionID;
    const artefactHash = node.artefactHash;
    const executionTime = node.executionTime;
    const duration = node.duration;
    const keywordName = resolvedArtefact?.attributes?.['name'];

    if (
      resolvedArtefact?._class !== 'CallKeyword' ||
      !executionId ||
      !artefactHash ||
      !keywordName ||
      executionTime === undefined ||
      duration === undefined ||
      duration <= 0
    ) {
      return undefined;
    }

    return {
      timeRange: {
        from: executionTime,
        to: executionTime + duration,
      },
      filters: [
        {
          attributeName: 'eId',
          label: 'Execution',
          isLocked: true,
          exactMatch: true,
          searchEntities: [{ searchValue: executionId }],
          type: FilterBarItemType.EXECUTION,
        },
        {
          attributeName: 'type',
          isLocked: true,
          exactMatch: true,
          freeTextValues: ['keyword'],
          searchEntities: [],
          type: FilterBarItemType.FREE_TEXT,
        },
        {
          attributeName: 'name',
          isLocked: true,
          exactMatch: false,
          freeTextValues: [keywordName],
          searchEntities: [],
          type: FilterBarItemType.FREE_TEXT,
        },
      ],
    };
  });

  protected readonly responseTimesConfig: StandaloneChartConfig = {
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
