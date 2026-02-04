import { InjectionToken, Provider } from '@angular/core';

export interface WidgetInfo {
  id: string;
  title: string;
  weight: number;
  widthInCells: number;
  heightInCells: number;
  //position: WidgetPositionParams;
}

export interface GridLayoutConfig {
  gridId: string;
  defaultElementParams: WidgetInfo[];
}

export const GRID_LAYOUT_CONFIG = new InjectionToken<GridLayoutConfig>('Grid layout config');

export const provideGridLayoutConfig = (gridId: string, defaultElementParams: WidgetInfo[] = []): Provider => ({
  provide: GRID_LAYOUT_CONFIG,
  useFactory: () => ({ gridId, defaultElementParams }),
});
