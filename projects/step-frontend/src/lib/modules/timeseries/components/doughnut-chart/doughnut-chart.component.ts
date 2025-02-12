import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  Input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  TemplateRef,
  viewChild,
  ViewChild,
} from '@angular/core';
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
  settings = input<DoughnutChartSettings>({ items: [] });
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  // @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  // ngAfterViewInit(): void {
  //   if (this.settings) {
  //     this.chart = this.createChart();
  //   }
  // }

  effect = effect(() => {
    let settings = this.settings();
    let canvas = this.canvas();
    if (settings && canvas) {
      this.createChart(settings, canvas);
    }
  });

  // ngOnChanges(changes: SimpleChanges): void {
  //   const settings = changes['settings'];
  //   if (settings && this.canvas) {
  //     this.chart?.destroy();
  //     this.createChart();
  //   }
  // }

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
