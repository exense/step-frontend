import {
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { ChartItemClickEvent, DoughnutChartSettings } from '../../types/doughnut-chart-settings';
import Chart, { ActiveElement, ChartEvent } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { StepCommonModule } from '../../../_common/step-common.module';
import { DoughnutChartTotalTemplateDirective } from '../../directives/doughnut-chart-total-template.directive';

@Component({
  selector: 'step-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
  imports: [StepCommonModule],
  standalone: true,
})
export class DoughnutChartComponent implements OnDestroy {
  readonly settings = input.required<DoughnutChartSettings>();
  readonly totalTooltip = input<string | undefined>(undefined);
  readonly chartItemClick = output<ChartItemClickEvent>();

  private readonly totalTemplateDirective = contentChild(DoughnutChartTotalTemplateDirective);
  protected readonly totalTemplate = computed(() => this.totalTemplateDirective()?.templateRef);

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private chart: Chart | undefined;

  updateChartEffect = effect(() => {
    let settings = this.settings();
    let canvas = this.canvas();
    if (settings && canvas) {
      if (this.chart) {
        this.chart.data.labels = settings.items.map((i) => i.label);
        this.chart.data.datasets[0].data = settings.items.map((i) => i.value);
        this.chart.data.datasets[0].backgroundColor = settings.items.map((i) => i.background);
        this.chart.update();
      } else {
        this.chart = this.createChart(settings, canvas);
      }
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
          duration: settings.viewMode === 'print' ? 0 : 500,
        },
        onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
          if (!elements.length) {
            return;
          }
          const index = elements[0].index;
          const label = (chart.data.labels?.[index] ?? '').toString();
          const value = (chart.data.datasets?.[0]?.data?.[index] ?? 0) as number;
          const background = (chart.data.datasets?.[0]?.backgroundColor as Record<number, string>)?.[index];
          this.chartItemClick.emit({
            item: {
              label,
              value,
              background,
            },
            shiftKey: (event.native as MouseEvent)?.shiftKey,
            ctrlKey: (event.native as MouseEvent)?.ctrlKey,
          });
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
