import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE, ViewMode } from '../../shared/view-mode';
import { STATUS_COLORS } from '@exense/step-core';

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeSummaryComponent implements OnDestroy {
  private _statusColors = inject(STATUS_COLORS);
  protected readonly _mode = inject(VIEW_MODE);

  /** @Input() **/
  title = input('');

  /** @Input() **/
  summary = input.required<ReportNodeSummary>();

  /** @Input() **/
  action = input<() => void>();

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

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('cnv');

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

  private chart = computed(() => {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) {
      return undefined;
    }
    return this.createChart(canvas);
  });

  private updateChartEffect = effect(() => {
    const dictionary = this.dictionary();
    const chart = this.chart();

    if (!dictionary || !chart) {
      return;
    }

    const items = Object.entries(this._statusColors)
      .map(([status, color]) => {
        const value = dictionary[status]?.percent ?? 0;
        return { status, color, value };
      })
      .filter((item) => item.value > 0);

    chart.data.labels = items.map((item) => item.status);
    chart.data.datasets[0]!.data = items.map((item) => item.value);
    chart.data.datasets[0]!.backgroundColor = items.map((item) => item.color);
    chart.data.datasets[0]!.borderColor = items.map((item) => item.color);
    chart.update();
  });

  ngOnDestroy(): void {
    this.chart()?.destroy();
  }

  private calcPercent(count: number, total: number): number {
    return Math.max(total ? Math.floor((count / total) * 100) : 0, 1);
  }

  private createChart(canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Dataset 1',
            data: [],
            backgroundColor: [],
          },
        ],
      },
      plugins: [ChartDataLabels],
      options: {
        animation: {
          duration: this._mode === ViewMode.PRINT ? 0 : 500,
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            color: '#fff',
            formatter: () => '',
          },
          tooltip: {
            enabled: false,
          },
        },
        onClick: this.action(),
      },
    });
  }
}
