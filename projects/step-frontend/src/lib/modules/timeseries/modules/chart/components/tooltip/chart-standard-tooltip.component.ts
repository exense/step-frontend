import { ChangeDetectionStrategy, Component, computed, input, Input, ViewEncapsulation } from '@angular/core';
import { COMMON_IMPORTS, TimeSeriesConfig } from '../../../_common';
import { TooltipContextData } from '../../injectables/tooltip-context-data';
import { TooltipRowEntry } from '../../types/tooltip-row-entry';
import { MarkerType } from '@exense/step-core';
import { SeriesStroke } from '../../../_common/types/time-series/series-stroke';

/**
 * This component represents a visual effect for a loading chart.
 */
@Component({
  selector: 'step-chart-standard-tooltip',
  templateUrl: './chart-standard-tooltip.component.html',
  styleUrls: ['./chart-standard-tooltip.component.scss'],
  standalone: true,
  imports: [COMMON_IMPORTS],
})
export class ChartStandardTooltipComponent {
  data = input.required<TooltipContextData>();

  elipsisBefore = false;
  elipsisAfter = false;

  timestamp = computed(() => {
    let idx = this.data().idx;
    if (idx !== undefined) {
      let timestamp = this.data().xValues[idx];
      return new Date(timestamp).toLocaleString();
    } else {
      return '';
    }
  });

  entries = computed(() => {
    const contextData = this.data();
    const settings = contextData.parentRef.settings.tooltipOptions;
    const idx: number = contextData.idx!;
    if (idx === undefined || contextData.idY === undefined) {
      return;
    }
    const hoveredValue: number = contextData.idY!;
    let yPoints: TooltipRowEntry[] = [];
    let summaryRow: TooltipRowEntry | undefined;
    // first series is x axis (time)
    const chartSeries = contextData.series;
    console.log(contextData);
    for (let i = 0; i < chartSeries.length; i++) {
      const series = chartSeries[i];
      const bucketValue = series.data[idx];
      if (series.scale !== TimeSeriesConfig.SECONDARY_AXES_KEY && series.show) {
        if (bucketValue != undefined) {
          const executionIds = contextData.parentRef.chartMetadata[i]?.[idx]?.[TimeSeriesConfig.EXECUTION_ID_ATTRIBUTE];
          let formattedValue = `${Math.trunc(bucketValue)} `;
          if (settings.yAxisUnit) {
            formattedValue += settings.yAxisUnit;
          }
          yPoints.push({
            value: bucketValue,
            formattedValue: formattedValue,
            name: series.label || '',
            // @ts-ignore
            stroke: series.strokeConfig,
            executions: executionIds,
            markerClassName: this.getMarkerClass(series.strokeConfig!),
          });
        }
        continue;
      }
      if (series.scale === TimeSeriesConfig.SECONDARY_AXES_KEY && bucketValue != null) {
        summaryRow = {
          value: bucketValue,
          stroke: { color: TimeSeriesConfig.TOTAL_BARS_COLOR, type: MarkerType.SQUARE },
          name: settings.zAxisLabel || 'Total',
        };
      }
    }
    yPoints.sort((a, b) => (a.value - b.value) * -1);
    const elementsToSelect = 5;
    let elipsisBefore = false;
    let elipsisAfter = false;
    const closestIndex = this.getClosestIndex(hoveredValue, yPoints);
    if (closestIndex >= 0) {
      yPoints[closestIndex].bold = true;
    }
    if (yPoints.length > elementsToSelect) {
      if (closestIndex < elementsToSelect / 2) {
        yPoints = yPoints.slice(0, elementsToSelect);
        elipsisAfter = true;
      } else if (yPoints.length - closestIndex < elementsToSelect / 2) {
        yPoints = yPoints.slice(-elementsToSelect);
        elipsisBefore = true;
      } else {
        yPoints = yPoints.slice(closestIndex - elementsToSelect / 2, closestIndex + elementsToSelect / 2);
        elipsisAfter = true;
        elipsisBefore = true;
      }
    }
    this.elipsisBefore = elipsisBefore;
    this.elipsisAfter = elipsisAfter;
    return yPoints;
  });

  private getMarkerClass(stroke: SeriesStroke): string {
    switch (stroke.type) {
      case MarkerType.SQUARE:
        return 'step-marker-filled-square';
      case MarkerType.DOTS:
        return 'step-marker-dots';
      case MarkerType.DASHED:
        return 'step-marker-dashed-square';
      default:
        return '';
    }
  }

  private getClosestIndex(num: number, arr: TooltipRowEntry[]): number {
    if (!arr || arr.length === 0) {
      return -1;
    }
    let curr = arr[0];
    let diff = Math.abs(num - curr.value);
    let index = 0;
    for (let val = 0; val < arr.length; val++) {
      let newdiff = Math.abs(num - arr[val].value);

      if (newdiff < diff) {
        diff = newdiff;
        curr = arr[val];
        index = val;
      }
    }
    return index;
  }
}
