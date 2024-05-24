import { Component, computed, effect, ElementRef, input, OnDestroy, viewChild, ViewEncapsulation } from '@angular/core';
import Chart from 'chart.js/auto';
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
  private chart = computed(() => {
    const canvas = this.canvas()?.nativeElement;
    if (!canvas) {
      return undefined;
    }
    return this.createChart(canvas);
  });

  private updateChartEffect = effect(() => {
    const summary = this.summary();
    const chart = this.chart();

    if (!summary || !chart) {
      return;
    }

    const items = Object.entries(STATUS_DICTIONARY)
      .map(([status, dictItem]) => {
        const value = summary[status as keyof ReportNodeSummary];
        return { ...dictItem, value };
      })
      .filter((item) => item.value > 0);

    chart.data.labels = items.map((item) => item.label);
    chart.data.datasets[0]!.data = items.map((item) => item.value);
    chart.data.datasets[0]!.backgroundColor = items.map((item) => item.color);
    chart.update();
  });

  ngOnDestroy(): void {
    this.chart()?.destroy();
  }

  private createChart(canvas: HTMLCanvasElement): Chart<'doughnut'> {
    return new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Dataset 1',
            data: [],
            backgroundColor: [],
            hoverOffset: 4,
          },
        ],
      },
    });
  }
}
