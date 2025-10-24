import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import Chart from 'chart.js/auto';

export interface TreeNodePieChartSlice {
  color: string;
  label: string;
  count: number;
}

@Component({
  selector: 'step-aggregated-tree-node-statuses-piechart',
  templateUrl: './aggregated-tree-node-statuses-piechart.component.html',
  styleUrls: ['./aggregated-tree-node-statuses-piechart.component.scss'],
  standalone: false,
})
export class AggregatedTreeNodeStatusesPiechartComponent implements OnDestroy {
  readonly slices = input.required<TreeNodePieChartSlice[]>();
  readonly size = input<number>(24);
  readonly startAngleDeg = input<number>(-90);
  readonly circumferenceDeg = input<number>(360);
  readonly emptyColor = input<string>('#e5e7eb');
  readonly highlight = input<boolean>(false);

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart | undefined;

  private renderEffect = effect(() => {
    const el = this.canvas();
    const sz = this.size();
    const start = this.startAngleDeg();
    const circ = this.circumferenceDeg();
    const empty = this.emptyColor();

    if (!el) return;

    const src = (this.slices() ?? [])
      .filter((s) => (s?.count ?? 0) > 0)
      .sort((s1, s2) => s1.label.localeCompare(s2.label));
    const total = src.reduce((a, s) => a + (s.count || 0), 0);

    const data =
      total === 0
        ? {
            labels: ['empty'],
            datasets: [{ data: [100], backgroundColor: [empty] }],
          }
        : {
            labels: src.map((s) => s.label),
            datasets: [
              {
                // feed raw counts to Chart.js (it will scale arcs proportionally)
                data: src.map((s) => s.count),
                backgroundColor: src.map((s) => s.color),
              },
            ],
          };

    const arcStyle =
      src.length <= 1
        ? { borderWidth: 0, borderColor: 'transparent', hoverBorderWidth: 0 }
        : { borderWidth: 1, borderColor: '#fff', hoverBorderWidth: 1 };

    const options = {
      responsive: false,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      elements: { arc: arcStyle },
      rotation: (start * Math.PI) / 180,
      circumference: (circ * Math.PI) / 180,
    } as const;

    if (this.chart) {
      // update in place
      this.chart.data.labels = data.labels as any;
      this.chart.data.datasets[0].data = data.datasets[0].data as any;
      (this.chart.data.datasets[0] as any).backgroundColor = data.datasets[0].backgroundColor as any;
      (this.chart.options as any).rotation = options.rotation;
      (this.chart.options as any).circumference = options.circumference;
      this.chart.update();
    } else {
      this.chart = new Chart(el.nativeElement, {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          animation: { duration: 0 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          elements: { arc: arcStyle },
        },
      }) as Chart;
      el.nativeElement.width = sz;
      el.nativeElement.height = sz;
    }
  });

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
