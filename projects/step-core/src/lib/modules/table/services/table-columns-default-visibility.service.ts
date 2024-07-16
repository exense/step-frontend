import { inject, Injectable } from '@angular/core';
import { TableColumnsDefaultVisibilityConfirmService } from './table-columns-default-visibility-confirm.service';
import { ScreenInput, TableApiWrapperService } from '../../../client/step-client-module';
import { ConfirmVisibilityStrategy } from '../types/confirm-visibility-strategy';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { TableColumnsConfig } from './table-columns-config.provider';
import { TableColumnsSettingsFactoryService } from './table-columns-settings-factory.service';

@Injectable({
  providedIn: 'root',
})
export class TableColumnsDefaultVisibilityService {
  private static screenTablesLinkageInfo = new Map<string, Set<TableColumnsConfig>>();

  static configureLinkage(config?: TableColumnsConfig | null): void {
    if (!config?.entityScreenId || !config.allowDefaultVisibilityConfiguration) {
      return;
    }

    if (!this.screenTablesLinkageInfo.has(config.entityScreenId)) {
      this.screenTablesLinkageInfo.set(config.entityScreenId, new Set([config]));
    } else {
      this.screenTablesLinkageInfo.get(config.entityScreenId)!.add(config);
    }
  }

  private _tableApi = inject(TableApiWrapperService);
  private _defaultVisibilityConfirmStrategy = inject(TableColumnsDefaultVisibilityConfirmService);
  private _columnsSettingsFactory = inject(TableColumnsSettingsFactoryService);
  private confirmStrategy: ConfirmVisibilityStrategy = this._defaultVisibilityConfirmStrategy;

  useStrategy(strategy: ConfirmVisibilityStrategy): void {
    this.confirmStrategy = strategy;
  }

  setupDefaultVisibilityForScreenInputColumn(screenInput: ScreenInput): Observable<unknown> {
    if (!screenInput.screenId) {
      return of(undefined);
    }
    const linkedConfigs = TableColumnsDefaultVisibilityService.screenTablesLinkageInfo.get(screenInput.screenId);
    if (!linkedConfigs?.size) {
      return of(undefined);
    }

    return this.confirmStrategy.confirmVisibility(screenInput).pipe(
      switchMap((confirmation) => {
        if (!confirmation?.isVisible) {
          return of(undefined);
        }

        const visibilityUpdateOperations = Array.from(linkedConfigs).map((config) =>
          this.setDefaultVisibility(config, screenInput, confirmation.scope),
        );

        return forkJoin(visibilityUpdateOperations);
      }),
    );
  }

  private setDefaultVisibility(
    config: TableColumnsConfig,
    screenInput: ScreenInput,
    scope: string[] = [],
  ): Observable<unknown> {
    return this._tableApi.getTableSettings(config.entityTableRemoteId).pipe(
      map((settings) => {
        settings = settings ?? {};
        settings.columnSettingList = settings.columnSettingList ?? [];
        const newColumnSettings = this._columnsSettingsFactory.createScreenInputColumnSettings(
          screenInput,
          0, // For columns at zero position, natural table's order will applied
          config,
          true,
        );
        settings.columnSettingList.push(newColumnSettings);
        return settings;
      }),
      switchMap((tableSettings) => {
        return this._tableApi.saveTableSettings(config.entityTableRemoteId, { tableSettings, scope });
      }),
    );
  }
}
