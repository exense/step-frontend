import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
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
export class DoughnutChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() settings!: DoughnutChartSettings;

  @ViewChild('canvas') private canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | undefined;

  ngAfterViewInit(): void {
    if (this.settings) {
      this.chart = this.createChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const settings = changes['settings'];
    if (settings && this.canvas) {
      this.chart?.destroy();
      this.createChart();
    }
  }

  private createChart(): Chart {
    return new Chart(this.canvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [this.settings.items.map((i) => i.label)],
        datasets: [
          {
            label: 'Test',
            data: this.settings.items.map((i) => i.value),
            backgroundColor: this.settings.items.map((i) => i.background),
          },
        ],
      },
      plugins: [ChartDataLabels],
      options: {
        animation: {
          duration: this.settings.viewMode === ViewMode.PRINT ? 0 : 500,
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
