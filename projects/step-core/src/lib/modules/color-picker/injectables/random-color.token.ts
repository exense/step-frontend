import { inject, InjectionToken } from '@angular/core';
import { COLORS } from './colors.token';

export const RANDOM_COLOR = new InjectionToken('Random color function', {
  providedIn: 'root',
  factory: () => {
    const colors = inject(COLORS);
    return () => {
      const index = Math.floor(Math.random() * colors.length);
      return colors[index];
    };
  },
});
