import { Component, computed, effect, ElementRef, input, OnDestroy, viewChild, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ReportNodeSummary } from '../../shared/report-node-summary';

const STATUS_DICTIONARY: Record<keyof Omit<ReportNodeSummary, 'total'>, { label: string; color: string }> = {
  running: { label: 'running', color: '#337ab7' },
  passed: { label: 'passed', color: '#5bc85c' },
  failed: { label: 'failed', color: '#d9534f' },
  techError: { label: 'technical error', color: '#000' },
};

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeSummaryComponent implements OnDestroy {
  /** @Input() **/
  title = input('');

  /** @Input() **/
  summary = input.required<ReportNodeSummary>();

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('cnv');

  private dictionary = computed(() => {
    const summary = this.summary();
    if (!summary) {
      return undefined;
    }
    return Object.keys(STATUS_DICTIONARY).reduce(
      (res, key) => {
        const value = summary[key as keyof ReportNodeSummary];
        if (value > 0) {
          const percent = this.calcPercent(value, summary.total);
          res[key] = { value, percent };
        }
        return res;
      },
      {} as Record<string, { value: number; percent: number }>,
    );
  });

  private valueDictionary = computed(() =>
    Object.values(this.dictionary() ?? {}).reduce(
      (res, item) => {
        res[item.percent] = item.value;
        return res;
      },
      {} as Record<number, number>,
    ),
  );

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

    const items = Object.entries(STATUS_DICTIONARY)
      .map(([status, dictItem]) => {
        const value = dictionary[status]?.percent ?? 0;
        return { ...dictItem, value };
      })
      .filter((item) => item.value > 0);

    chart.data.labels = items.map((item) => item.label);
    chart.data.datasets[0]!.data = items.map((item) => item.value);
    chart.data.datasets[0]!.backgroundColor = items.map((item) => item.color);
    chart.data.datasets[0]!.borderColor = items.map((item) => item.color);
    chart.update();
  });

  ngOnDestroy(): void {
    this.chart()?.destroy();
  }

  private calcPercent(count: number, total: number): number {
    return Math.max(total ? Math.floor((count / total) * 100) : 0, 5);
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
        plugins: {
          datalabels: {
            color: '#fff',
            formatter: (value, context) => {
              return this.valueDictionary()[value] ?? value;
            },
            font: {
              weight: 'bold',
              size: 14,
            },
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  }
}
