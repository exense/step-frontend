import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { HeatMapColor } from '../heatmap.component';

export interface LegendStop {
  color: string; // e.g. '#ff595b' or 'rgb(...)'
  label: string; // e.g. 'Failed'
  position?: number; // optional in [0,1] (0%..100%); if omitted, evenly spaced
}

interface ComputedStop {
  color: string;
  label: string;
  posPct: number; // 0..100
}

@Component({
  selector: 'step-heatmap-gradient-legend',
  templateUrl: './gradient-legend.component.html',
  styleUrls: ['./gradient-legend.component.scss'],
  standalone: false,
})
export class GradientLegendComponent implements OnChanges {
  @Input() gradientStops: HeatMapColor[] = [];
  @Input() fixedColors: HeatMapColor[] = [];
  @Input() barHeight = 14;
  @Input() showTicks = true;

  computed: ComputedStop[] = [];
  gradientCss = '';

  ngOnChanges(_changes: SimpleChanges): void {
    this.recompute();
  }

  private recompute(): void {
    const clean = (this.gradientStops || []).filter((s) => !!s && !!s.hex && !!s.label);

    if (clean.length === 0) {
      this.computed = [];
      this.gradientCss = 'transparent';
      return;
    }

    // Determine positions
    let withPos: ComputedStop[];

    // Evenly spaced across 0..100
    const n = clean.length;
    withPos = clean.map((s, i) => ({
      color: s.hex,
      label: s.label,
      posPct: n === 1 ? 0 : Math.round((i / (n - 1)) * 100),
    }));

    this.computed = withPos;

    // Build linear-gradient with explicit color stops
    // e.g., 'linear-gradient(to right, #ff595b 0%, #e1cc01 50%, #01a990 100%)'
    this.gradientCss = `linear-gradient(to right, ${withPos.map((s) => `${s.color} ${s.posPct}%`).join(', ')})`;
  }
}
