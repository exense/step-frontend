import { Component, effect, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import Chart from 'chart.js/auto';

export interface TreeNodePieChartSlice {
  color: string;
  label: string;
  percentage: number; // 0..100 (doesn't have to sum exactly 100; we normalize)
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

  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: any;

  // Create / update whenever inputs or canvas change
  private update = effect(() => {
    const el = this.canvas();
    const sz = this.size();
    const start = this.startAngleDeg();
    const circ = this.circumferenceDeg();
    const empty = this.emptyColor();

    if (!el) return;

    // Build dataset from provided slices (normalize to sum=100)
    const src = (this.slices() ?? []).filter((s) => (s?.percentage ?? 0) > 0);
    const sum = src.reduce((a, s) => a + (s.percentage || 0), 0);
    const norm = sum > 0 ? (v: number) => (v / sum) * 100 : (_: number) => 0;

    const data =
      src.length === 0
        ? {
            labels: ['empty'],
            datasets: [{ data: [100], backgroundColor: [empty] }],
          }
        : {
            labels: src.map((s) => s.label),
            datasets: [
              {
                data: src.map((s) => +norm(s.percentage).toFixed(6)), // keep numeric
                backgroundColor: src.map((s) => s.color),
              },
            ],
          };

    const options = {
      responsive: false,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      elements: { arc: { borderWidth: 0 } },
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
      const x = {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
          {
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
            hoverOffset: 4,
          },
        ],
      };
      this.chart = new Chart(el.nativeElement, {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          //   maintainAspectRatio: false,
          animation: { duration: 0 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          elements: { arc: { borderWidth: 1 } },
          // rotation: (start * Math.PI) / 180,
          //   circumference: (circ * Math.PI) / 180,
          // },
          // explicit canvas size (since responsive:false)
        },
      });
      el.nativeElement.width = sz;
      el.nativeElement.height = sz;
    }
  });

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
