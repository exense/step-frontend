import { inject, Provider } from '@angular/core';
import { GRID_LAYOUT_CONFIG } from './grid-layout-config.token';
import { GridElementInfo, GridSettingsRegistryService } from '../../custom-registeries/custom-registries.module';
import { WidgetsPositionsStateService } from './widgets-positions-state.service';
import { WidgetsVisibilityStateService } from './widgets-visibility-state.service';
import { WidgetsPositionsUtilsService } from './widgets-positions-utils.service';
import { WidgetsPersistenceStateService } from './widgets-persistence-state.service';
import { GridEditableService } from './grid-editable.service';

export const provideGridLayoutConfig = (gridId: string, params: GridElementInfo[] = []): Provider[] => [
  {
    provide: GRID_LAYOUT_CONFIG,
    useFactory: () => {
      const _gridSettingsRegistry = inject(GridSettingsRegistryService);
      const registeredElements = _gridSettingsRegistry.getSettings(gridId);
      const defaultElementParams = [...registeredElements, ...params].sort((a, b) => a.weight - b.weight);

      const defaultElementParamsMap = defaultElementParams.reduce(
        (res, item) => {
          res[item.id] = item;
          return res;
        },
        {} as Record<string, GridElementInfo>,
      );

      return { gridId, defaultElementParams, defaultElementParamsMap };
    },
  },
  WidgetsPositionsUtilsService,
  WidgetsPositionsStateService,
  {
    provide: WidgetsVisibilityStateService,
    useExisting: WidgetsPositionsStateService,
  },
  {
    provide: GridEditableService,
    useExisting: WidgetsPositionsStateService,
  },
  WidgetsPersistenceStateService,
];
