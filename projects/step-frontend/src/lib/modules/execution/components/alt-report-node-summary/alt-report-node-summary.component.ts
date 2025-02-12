import { Component, computed, effect, inject, input, ViewEncapsulation } from '@angular/core';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { STATUS_COLORS } from '@exense/step-core';
import {
  DoughnutChartItem,
  DoughnutChartSettings,
} from '../../../timeseries/components/doughnut-chart/doughnut-chart-settings';

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeSummaryComponent {
  private _statusColors = inject(STATUS_COLORS);
  protected readonly _mode = inject(VIEW_MODE);

  /** @Input() **/
  title = input('');

  /** @Input() **/
  summary = input.required<ReportNodeSummary>();

  chartSettings: DoughnutChartSettings | undefined;

  protected readonly legend = computed(() => {
    const summary = this.summary();
    const keysSet = new Set(Object.keys(summary));
    keysSet.delete('total');
    keysSet.add('TECHNICAL_ERROR');
    keysSet.add('FAILED');

    const items = Array.from(keysSet).map((status) => {
      const value = summary?.[status] ?? 0;
      return { status, value };
    });

    return items;
  });

  private dictionary = computed(() => {
    const summary = this.summary();
    if (!summary?.total) {
      return {
        ['EMPTY']: { value: 100, percent: 100 },
      };
    }
    return Object.keys(this._statusColors).reduce(
      (res, key) => {
        const value = summary[key];
        if (value > 0) {
          const percent = this.calcPercent(value, summary.total);
          res[key] = { value, percent };
        }
        return res;
      },
      {} as Record<string, { value: number; percent: number }>,
    );
  });

  private updateChartEffect = effect(() => {
    const dictionary = this.dictionary();

    if (!dictionary) {
      return;
    }

    const items: DoughnutChartItem[] = Object.entries(this._statusColors)
      .map(([status, color]) => {
        const value = dictionary[status]?.percent ?? 0;
        return { label: status, background: color, value };
      })
      .filter((item) => item.value > 0);

    this.chartSettings = {
      items: items,
      total: this.summary().total,
      viewMode: this._mode,
    };
  });

  private calcPercent(count: number, total: number): number {
    return Math.max(total ? Math.floor((count / total) * 100) : 0, 1);
  }
}
