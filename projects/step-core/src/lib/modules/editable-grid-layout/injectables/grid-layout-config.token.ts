import { WidgetPositionParams } from '../types/widget-position';
import { InjectionToken, Provider } from '@angular/core';

export interface WidgetInfo {
  title: string;
  position: WidgetPositionParams;
}

export interface GridLayoutConfig {
  gridId: string;
  defaultElementParams: Record<string, WidgetInfo>;
}

export const GRID_LAYOUT_CONFIG = new InjectionToken<GridLayoutConfig>('Grid layout config');

export const provideGridLayoutConfig = (
  gridId: string,
  defaultElementParams: Record<string, WidgetInfo> = {},
): Provider => ({
  provide: GRID_LAYOUT_CONFIG,
  useFactory: () => ({ gridId, defaultElementParams }),
});
