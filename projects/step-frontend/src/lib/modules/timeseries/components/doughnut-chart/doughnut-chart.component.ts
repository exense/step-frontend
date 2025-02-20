import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { DoughnutChartSettings } from './doughnut-chart-settings';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ViewMode } from '../../../execution/shared/view-mode';
import { StepCommonModule } from '../../../_common/step-common.module';

@Component({
  selector: 'step-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
  imports: [StepCommonModule],
  standalone: true,
})
export class DoughnutChartComponent implements OnDestroy {
  /** @Input() **/
  readonly settings = input.required<DoughnutChartSettings>();

  /** @ViewChild() **/
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private chart: Chart | undefined;

  private effectRecreateChart = effect(() => {
    let settings = this.settings();
    let canvas = this.canvas();
    if (settings && canvas) {
      this.chart?.destroy();
      this.chart = this.createChart(settings, canvas);
    }
  });

  private createChart(settings: DoughnutChartSettings, canvas: ElementRef<HTMLCanvasElement>): Chart {
    return new Chart(canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [settings.items.map((i) => i.label)],
        datasets: [
          {
            label: 'Test',
            data: settings.items.map((i) => i.value),
            backgroundColor: this.settings().items.map((i) => i.background),
          },
        ],
      },
      plugins: [ChartDataLabels],
      options: {
        animation: {
          duration: settings.viewMode === ViewMode.PRINT ? 0 : 500,
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
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
