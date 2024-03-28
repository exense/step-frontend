import { Provider } from '@angular/core';

export abstract class TableColumnsConfig {
  readonly entityTableRemoteId!: string;
  readonly entityScreenId?: string;
}

export const tableColumnsConfigProvider = (config: TableColumnsConfig | null): Provider => ({
  provide: TableColumnsConfig,
  useValue: config,
});
