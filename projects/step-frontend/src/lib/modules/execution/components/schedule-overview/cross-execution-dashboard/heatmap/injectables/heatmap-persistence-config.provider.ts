import { HeatmapPersistenceConfig } from './heatmap-persistence-config';
import { Provider } from '@angular/core';

export type HeatmapPersistenceConfigProviderOptions = Omit<HeatmapPersistenceConfig, 'heatmapId'>;

export const HEATMAP_STORE_ALL: HeatmapPersistenceConfigProviderOptions = {
  storePagination: true,
};

export const heatmapPersistenceConfigProvider = (
  heatmapId: string,
  options: HeatmapPersistenceConfigProviderOptions = {},
): Provider => ({
  provide: HeatmapPersistenceConfig,
  useValue: {
    heatmapId,
    ...options,
  } as HeatmapPersistenceConfig,
});
