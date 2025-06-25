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
import { TooltipContextData } from '../../../../timeseries/modules/chart/injectables/tooltip-context-data';
import { AugmentedTimeSeriesService, ExecutionsService, FetchBucketsRequest } from '@exense/step-core';
import { TSChartSeries } from '../../../../timeseries/modules/chart';
import { of, switchMap } from 'rxjs';

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
})
export class ExecutionsChartTooltipComponent {
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _executionService = inject(ExecutionsService);
  private _timeSeriesService = inject(AugmentedTimeSeriesService);

  reposition = output<void>();

  readonly data = input<TooltipContextData | undefined>(undefined);
  readonly taskId = input.required<string>();

  readonly EXECUTIONS_LIST_LIMIT = 10;

  selectedSeries?: TransformedSeries;
  selectedSeriesExecutions: ExecutionItem[] = [];
  executionsListTruncated: boolean = false;

  readonly transformedData: Signal<TransformedSeries[]> = computed(() => {
    const contextData = this.data();
    this.selectedSeriesExecutions = [];
    this.executionsListTruncated = false;
    this.selectedSeries = undefined;
    const transformedSeries: TransformedSeries[] = [];
    for (let i = contextData!.series.length - 1; i >= 0; i--) {
      let series: TSChartSeries = contextData!.series[i]!;
      let value =
        i === 0
          ? series.data[contextData?.idx!] || 0
          : (series.data[contextData!.idx!] || 0) - (contextData!.series[i - 1].data[contextData!.idx!] || 0);
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
    const taskId = this.taskId();
    const limit = 10;

    const request: FetchBucketsRequest = {
      start: item.timestamp,
      end: item.timestamp + bucketInterval,
      numberOfBuckets: 1,
      oqlFilter: `attributes.metricType = \"executions/duration\" and attributes.taskId = ${taskId} and attributes.result = ${item.label}`,
      groupDimensions: ['eId'],
      maxNumberOfSeries: 10,
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
        this.selectedSeriesExecutions = executions
          .filter((ex) => {
            return ex.result === item.label;
          })
          .map((execution) => {
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
