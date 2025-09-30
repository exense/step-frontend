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
    const clean = (gradientStops || []).filter((color) => !!color && !!color.hex && !!color.label);

    if (clean.length === 0) {
      return [];
    }

    // Evenly spaced across 0..100
    const n = clean.length;
    return clean.map<ComputedStop>((heatmapColor, i) => ({
      color: heatmapColor.hex,
      label: heatmapColor.label,
      posPct: n === 1 ? 0 : Math.round((i / (n - 1)) * 100),
    })) as ComputedStop[];
  });

  gradientCss = computed(() => {
    const data = this.computedData();
    if (data.length === 0) {
      return 'transparent';
    } else {
      return `linear-gradient(to right, ${data.map((stopItem) => `${stopItem.color} ${stopItem.posPct}%`).join(', ')})`;
    }
  });
}
