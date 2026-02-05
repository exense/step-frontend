import { inject, InjectionToken, Provider } from '@angular/core';
import { GridElementInfo, GridSettingsRegistryService } from '../../custom-registeries/custom-registries.module';

export interface GridLayoutConfig {
  gridId: string;
  defaultElementParams: GridElementInfo[];
  defaultElementParamsMap: Record<string, GridElementInfo>;
}

export const GRID_LAYOUT_CONFIG = new InjectionToken<GridLayoutConfig>('Grid layout config');

export const provideGridLayoutConfig = (gridId: string, params: GridElementInfo[] = []): Provider => ({
  provide: GRID_LAYOUT_CONFIG,
  useFactory: () => {
    const _gridSettingsRegistry = inject(GridSettingsRegistryService);
    const defaultElementParams = [..._gridSettingsRegistry.getSettings(gridId), ...params].sort(
      (a, b) => a.weight - b.weight,
    );

    const defaultElementParamsMap = defaultElementParams.reduce(
      (res, item) => {
        res[item.id] = item;
        return res;
      },
      {} as Record<string, GridElementInfo>,
    );

    return { gridId, defaultElementParams, defaultElementParamsMap };
  },
});
