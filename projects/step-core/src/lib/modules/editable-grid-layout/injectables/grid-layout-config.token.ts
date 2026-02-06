import { InjectionToken } from '@angular/core';
import { GridElementInfo } from '../../custom-registeries/custom-registries.module';

export interface GridLayoutConfig {
  gridId: string;
  defaultElementParams: GridElementInfo[];
  defaultElementParamsMap: Record<string, GridElementInfo>;
}

export const GRID_LAYOUT_CONFIG = new InjectionToken<GridLayoutConfig>('Grid layout config');
