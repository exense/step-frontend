import { Component, computed, input, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HeatMapColor } from '../types/heatmap-types';

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
export class GradientLegendComponent {
  gradientStops = input.required<HeatMapColor[]>();
  barHeight = input<number>(14);

  computedData = computed(() => {
    const gradientStops = this.gradientStops();
    const clean = (gradientStops || []).filter((s) => !!s && !!s.hex && !!s.label);

    if (clean.length === 0) {
      return [];
    }

    // Evenly spaced across 0..100
    const n = clean.length;
    return clean.map<ComputedStop>((s, i) => ({
      color: s.hex,
      label: s.label,
      posPct: n === 1 ? 0 : Math.round((i / (n - 1)) * 100),
    })) as ComputedStop[];
  });

  gradientCss = computed(() => {
    const data = this.computedData();
    if (data.length > 0) {
      return 'transparent';
    } else {
      return `linear-gradient(to right, ${data.map((s) => `${s.color} ${s.posPct}%`).join(', ')})`;
    }
  });
}
