import { InjectionToken } from '@angular/core';

const COLUMN_COUNT = 8;

export const GRID_COLUMN_COUNT = new InjectionToken('Grid column count', {
  providedIn: 'root',
  factory: () => COLUMN_COUNT,
});
