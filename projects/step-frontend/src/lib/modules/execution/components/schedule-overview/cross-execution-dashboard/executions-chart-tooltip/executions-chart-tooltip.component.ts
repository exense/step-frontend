import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
  ViewEncapsulation,
} from '@angular/core';
import { TooltipContextData } from '../../../../../timeseries/modules/chart/injectables/tooltip-context-data';
import { AugmentedTimeSeriesService, ExecutionsService, FetchBucketsRequest } from '@exense/step-core';
import { TSChartSeries } from '../../../../../timeseries/modules/chart';
import { of, switchMap } from 'rxjs';
import { FilterUtils, OQLBuilder, TimeSeriesConfig } from '../../../../../timeseries/modules/_common';
import { CrossExecutionDashboardState } from '../cross-execution-dashboard-state';

interface TransformedSeries {
  label: string;
  color: string;
  value: number;
  timestamp: number;
}

interface ExecutionItem {
  id: string;
  name: string;
  timestamp: string;
}

@Component({
  selector: 'step-executions-chart-tooltip',
  templateUrl: './executions-chart-tooltip.component.html',
  styleUrls: ['./executions-chart-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionsChartTooltipComponent {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _executionService = inject(ExecutionsService);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);
  readonly _state = inject(CrossExecutionDashboardState);

  reposition = output<void>();

  readonly data = input<TooltipContextData | undefined>(undefined);
  readonly scaleKey = input.required<string>();

  selectedSeries?: TransformedSeries;
  selectedSeriesExecutions: ExecutionItem[] = [];
  executionsListTruncated: boolean = false;

  readonly timeRange = computed(() => {
    const contextData = this.data();
    const bucketRange = (contextData?.xValues[1] || 0) - (contextData?.xValues[0] || 0);

    if (!contextData || !bucketRange || !contextData.idx) {
      return undefined;
    }

    const bucketStart = contextData.xValues[contextData.idx];
    const bucketEnd = bucketStart + bucketRange;
    return `${new Date(bucketStart).toLocaleString()} - ${new Date(bucketEnd).toLocaleString()}`;
  });

  readonly responseTime = computed(() => {
    const contextData = this.data();
    if (!contextData || !contextData.idx) {
      return;
    }
    const lastSeries: TSChartSeries = contextData.series?.filter((s) => s.scale === 'y')?.[0];
    const ms = lastSeries?.data[contextData.idx!];
    return ms !== undefined ? TimeSeriesConfig.AXES_FORMATTING_FUNCTIONS.time(ms!) : undefined;
  });

  readonly transformedData: Signal<TransformedSeries[]> = computed(() => {
    const contextData = this.data();
    this.selectedSeriesExecutions = [];
    this.executionsListTruncated = false;
    this.selectedSeries = undefined;
    const transformedSeries: TransformedSeries[] = [];
    if (!contextData) {
      return [];
    }
    const filteredSeries = contextData.series.filter((s) => s.scale === this.scaleKey());
    for (let i = filteredSeries.length - 1; i >= 0; i--) {
      let series: TSChartSeries = filteredSeries[i]!;
      let value =
        i === 0
          ? series.data[contextData?.idx!] || 0
          : (series.data[contextData!.idx!] || 0) - (filteredSeries[i - 1].data[contextData!.idx!] || 0);
      if (value) {
        transformedSeries.push({
          label: series.id,
          //@ts-ignore
          color: series._stroke,
          timestamp: contextData!.xValues[contextData!.idx!],
          value: value,
        });
      }
    }
    return transformedSeries;
  });

  selectSeries(series: TransformedSeries) {
    this.selectedSeries = series;
    // wait for the rendering to takes effect
    this.fetchExecutionsForSelectedItem(series, () => setTimeout(() => this.reposition.emit(), 200));
  }

  fetchExecutionsForSelectedItem(item: TransformedSeries, callback?: () => void) {
    const data = this.data()!;
    const bucketInterval = data.xValues[1] - data.xValues[0];
    const limit = 10;

    // const statusAttribute = this._state.getViewType() === 'task' ? 'result' : 'rnStatus';

    const oql = new OQLBuilder()
      .open('and')
      .append('attributes.metricType = "executions/duration"')
      .append(FilterUtils.filtersToOQL([this._state.getDashboardFilter()], 'attributes'))
      .append(`attributes.result = ${item.label}`)
      .build();

    const request: FetchBucketsRequest = {
      start: item.timestamp,
      end: item.timestamp + bucketInterval,
      numberOfBuckets: 1,
      oqlFilter: oql,
      groupDimensions: ['eId'],
      maxNumberOfSeries: limit,
    };
    this._timeSeriesService
      .getTimeSeries(request)
      .pipe(
        switchMap((timeSeriesResponse) => {
          const eIds = timeSeriesResponse.matrixKeys.map((attr) => attr['eId']);
          if (eIds?.length > 0) {
            return this._executionService.getExecutionsByIds(eIds);
          } else {
            return of([]);
          }
        }),
      )
      .subscribe((executions) => {
        this.selectedSeriesExecutions = executions.map((execution) => {
          return {
            id: execution.id!,
            name: execution.description!,
            timestamp: new Date(execution.startTime!).toLocaleString(),
          };
        });
        this.executionsListTruncated = executions.length >= limit;
        this._changeDetectorRef.detectChanges();
        callback?.();
      });
  }

  jumpToExecution(execution: ExecutionItem) {
    window.open(`#/executions/${execution.id!}/report`);
  }
}
