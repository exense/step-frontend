import { computed, inject, Injectable, signal } from '@angular/core';
import { ColumnSettings, TableSettings } from '../../../client/step-client-module';
import { MatColumnDef } from '@angular/material/table';
import { TableColumnsConfig } from './table-columns-config.provider';
import { TableApiWrapperService } from '../../../client/table/step-table-client.module';
import { TableColumnsDefinitionService } from './table-columns-definition.service';
import { map, Observable, of } from 'rxjs';
import { ColumnInfo } from '../types/column-info';
import { TableColumnsSettingsFactoryService } from './table-columns-settings-factory.service';

enum VisibilityState {
  HIDDEN,
  VISIBLE,
}

export enum PlacePosition {
  LEFT = 'left',
  RIGHT = 'right',
}

interface DefaultSettings {
  tableSettings: TableSettings;
  actionColumnsIds: string[];
}

@Injectable()
export class TableColumnsService {
  private _tableApi = inject(TableApiWrapperService);
  private _columnsConfig = inject(TableColumnsConfig, { optional: true });
  private _columnsDefinition = inject(TableColumnsDefinitionService);
  private _columnsSettingsFactory = inject(TableColumnsSettingsFactoryService);

  private defaultVisibleScreenColumns?: Set<string> = !!this._columnsConfig?.entityScreenDefaultVisibleFields
    ? new Set(this._columnsConfig?.entityScreenDefaultVisibleFields)
    : undefined;

  readonly hasConfig = !!this._columnsConfig;
  readonly remoteColumnsScreenId = this._columnsConfig?.entityScreenId;
  readonly entityScreenSubPath = this._columnsConfig?.entityScreenSubPath;
  readonly customColumnOptions = this._columnsConfig?.customColumnOptions;

  private hasChangesInternal = signal(false);

  readonly hasChanges = this.hasChangesInternal.asReadonly();

  private originalSettings?: TableSettings;
  private settings = signal<TableSettings | undefined>(undefined);

  readonly hiddenColumns = computed(() =>
    this.prepareColumns(this.settings()?.columnSettingList, VisibilityState.HIDDEN),
  );
  readonly visibleColumns = computed(() =>
    this.prepareColumns(this.settings()?.columnSettingList, VisibilityState.VISIBLE),
  );

  initialize(): void {
    this.getTableSettings().subscribe((settings) => {
      this.originalSettings = settings;
      this.settings.set(settings);
    });
  }

  showColumn(columnId: string): void {
    if (this.visibleColumns().includes(columnId)) {
      return;
    }
    this.changeColumnVisibilityState(columnId, VisibilityState.VISIBLE);
  }

  hideColumn(columnId: string): void {
    if (this.hiddenColumns().includes(columnId)) {
      return;
    }
    this.changeColumnVisibilityState(columnId, VisibilityState.HIDDEN);
  }

  moveColumn(column: string, placeRelativeToColumn: string, placePosition: PlacePosition): void {
    if (!this._columnsConfig?.entityTableRemoteId) {
      return;
    }
    const settings = this.settings();
    let columns = [...(settings?.columnSettingList ?? [])];
    columns.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const columnToMove = columns.find((col) => col.columnId === column);
    if (!columnToMove) {
      return;
    }
    columns = columns.filter((col) => col !== columnToMove);
    let relativeIndex = columns.findIndex((col) => col.columnId === placeRelativeToColumn);
    if (relativeIndex < 0) {
      return;
    }
    if (placePosition === PlacePosition.RIGHT) {
      relativeIndex++;
    }
    if (relativeIndex >= columns.length) {
      columns.push(columnToMove);
    } else {
      columns.splice(relativeIndex, 0, columnToMove);
    }

    columns.forEach((col, i) => (col.position = i));
    this.settings.set({ ...settings });
    this.hasChangesInternal.set(true);
  }

  saveSettingsForScope(scope: string[] = []): void {
    if (!this.hasChangesInternal() || !this._columnsConfig?.entityTableRemoteId) {
      return;
    }
    const tableSettings = this.settings();
    this._tableApi
      .saveTableSettings(this._columnsConfig.entityTableRemoteId, { tableSettings, scope })
      .subscribe(() => {
        this.originalSettings = this.settings();
        this.hasChangesInternal.set(false);
      });
  }

  resetSettings(): void {
    if (!this.hasChanges()) {
      return;
    }
    this.settings.set(this.originalSettings);
    this.hasChangesInternal.set(false);
  }

  private getTableSettings(): Observable<TableSettings> {
    const defaultSettings = this.getDefaultSettings();
    if (!this._columnsConfig?.entityTableRemoteId) {
      return of(defaultSettings.tableSettings);
    }
    return this._tableApi
      .getTableSettings(this._columnsConfig.entityTableRemoteId)
      .pipe(
        map((settings) =>
          this.mergeSettings(settings, defaultSettings.tableSettings, defaultSettings.actionColumnsIds),
        ),
      );
  }

  private getDefaultSettings(): DefaultSettings {
    const infoDictionary = (this._columnsDefinition.contentColumns?.() ?? [])
      .reduce((res, col) => [...res, ...col.columnInfos], [] as ColumnInfo[])
      .reduce(
        (res, item) => {
          res[item.columnId] = item;
          return res;
        },
        {} as Record<string, ColumnInfo>,
      );

    const mainColumnsDefinitions = (this._columnsDefinition.contentColumns?.() ?? []).filter(
      (col) => !col.isActionColumn,
    );

    const actionColumnsDefinitions = (this._columnsDefinition.contentColumns?.() ?? []).filter(
      (col) => col.isActionColumn,
    );

    const remoteColumnsDefinitions = this._columnsDefinition.customRemoteColumns?.()?.displayColumns() ?? [];

    let columnSettingList = mainColumnsDefinitions
      .reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[])
      .map((col, i) => this._columnsSettingsFactory.createStandardColumnSettings(col, i, infoDictionary));

    const remoteColumns = remoteColumnsDefinitions.map((screenInput, i) =>
      this._columnsSettingsFactory.createScreenInputColumnSettings(
        screenInput,
        columnSettingList.length + i,
        this._columnsConfig,
        !!this.defaultVisibleScreenColumns?.has(screenInput.input!.id!),
      ),
    );

    columnSettingList = [...columnSettingList, ...remoteColumns];

    const actionsColumns = actionColumnsDefinitions
      .reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[])
      .map((col, i) =>
        this._columnsSettingsFactory.createStandardColumnSettings(col, columnSettingList.length + i, infoDictionary),
      );

    columnSettingList = [...columnSettingList, ...actionsColumns];

    const tableSettings: TableSettings = { columnSettingList };
    const actionColumnsIds = actionsColumns.map((col) => col.columnId!);

    return { tableSettings, actionColumnsIds };
  }

  private prepareColumns(columns: ColumnSettings[] = [], visibility: VisibilityState): string[] {
    const cols = columns.filter((col) => (visibility === VisibilityState.VISIBLE ? col.visible : !col.visible));
    cols.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return cols.map((col) => col.columnId!);
  }

  private changeColumnVisibilityState(columnId: string, visibility: VisibilityState): void {
    if (!this._columnsConfig?.entityTableRemoteId) {
      return;
    }
    const tableSettings = this.settings();
    const columnSettingList = [...(tableSettings?.columnSettingList ?? [])];
    const columnIndex = columnSettingList.findIndex((col) => col.columnId === columnId);
    if (columnIndex < 0) {
      return;
    }

    columnSettingList[columnIndex] = {
      ...columnSettingList[columnIndex],
      visible: visibility === VisibilityState.VISIBLE,
    };
    this.settings.set({ ...tableSettings, columnSettingList });
    this.hasChangesInternal.set(true);
  }

  private mergeSettings(
    remoteTableSettings: TableSettings | undefined,
    defaultTableSettings: TableSettings,
    actionColumnIds: string[],
  ): TableSettings {
    if (!remoteTableSettings) {
      return defaultTableSettings;
    }

    const defaultColumnKeysAndPositions = new Map(
      (defaultTableSettings.columnSettingList ?? []).map((col) => [col.columnId, col.position]),
    );
    const actionColumnKeys = new Set(actionColumnIds);

    // Remove columns from settings, that was deleted
    // Also remove action columns from remote settings, because remote settings position might be wrong
    // in case if new custom columns have been added
    remoteTableSettings.columnSettingList = (remoteTableSettings.columnSettingList ?? [])
      .filter((col) => defaultColumnKeysAndPositions.has(col.columnId) && !actionColumnKeys.has(col.columnId!))
      .map((col) => {
        // Special case to properly initialize newly added default column position
        // If it not set, try to get it from default columns.
        if (!col.position) {
          col.position = defaultColumnKeysAndPositions.get(col.columnId!);
        }
        return col;
      });

    // Add new columns
    const removeColumnsKey = new Set(remoteTableSettings.columnSettingList.map((col) => col.columnId));
    const columnsToAdd = (defaultTableSettings.columnSettingList ?? []).filter(
      (col) => !removeColumnsKey.has(col.columnId),
    );

    remoteTableSettings.columnSettingList = remoteTableSettings.columnSettingList.concat(columnsToAdd);

    return remoteTableSettings;
  }
}
