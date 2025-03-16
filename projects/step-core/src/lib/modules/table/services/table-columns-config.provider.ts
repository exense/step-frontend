import { Provider } from '@angular/core';
import { TableColumnsDefaultVisibilityService } from './table-columns-default-visibility.service';

export abstract class TableColumnsConfig {
  readonly entityTableRemoteId!: string;
  readonly entityScreenId?: string;
  readonly entityScreenSubPath?: string;
  readonly entityScreenDefaultVisibleFields?: string[];
  readonly customColumnOptions?: string | string[];
  readonly allowDefaultVisibilityConfiguration?: boolean;
}

export const tableColumnsConfigProvider = (config: TableColumnsConfig | null): Provider => {
  TableColumnsDefaultVisibilityService.configureLinkage(config);

  return {
    provide: TableColumnsConfig,
    useValue: config,
  };
};
