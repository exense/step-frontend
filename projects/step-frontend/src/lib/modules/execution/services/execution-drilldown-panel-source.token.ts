import { InjectionToken } from '@angular/core';
import { ExecutionDrilldownSource } from './execution-drilldown-state.service';

export const EXECUTION_DRILLDOWN_PANEL_SOURCE = new InjectionToken<ExecutionDrilldownSource | undefined>(
  'Execution drilldown panel source',
  {
    providedIn: 'root',
    factory: () => undefined,
  },
);
