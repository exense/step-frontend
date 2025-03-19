import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { TooltipContextData } from '../../../../timeseries/modules/chart/injectables/tooltip-context-data';
import {
  Execution,
  ExecutionsService,
  SortDirection,
  TableApiWrapperService,
  TableRequestData,
} from '@exense/step-core';
import { TSChartSeries } from '../../../../timeseries/modules/chart';

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
})
export class ExecutionsChartTooltipComponent {
  private _tableApiWrapper = inject(TableApiWrapperService);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _executionService = inject(ExecutionsService);

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
    this.fetchExecutionsForSelectedItem(series);
  }

  fetchExecutionsForSelectedItem(item: TransformedSeries) {
    let data = this.data()!;
    let chartInterval = data.xValues[1] - data.xValues[0];
    const limit = 50;
    this._executionService
      .getLastExecutionsByTaskId(this.taskId(), limit, item.timestamp, item.timestamp + chartInterval)
      .subscribe((executions) => {
        this.selectedSeriesExecutions = executions
          .filter((ex) => {
            console.log(ex);
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
      });
  }

  jumpToExecution(execution: ExecutionItem) {
    window.open(`#/executions/${execution.id!}/viz`);
  }
}
