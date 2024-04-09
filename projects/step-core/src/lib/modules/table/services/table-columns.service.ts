import { computed, inject, Injectable, signal } from '@angular/core';
import { ColumnSettings, ScreenInput, ScreenInputColumnSettings, TableSettings } from '../../../client/generated';
import { MatColumnDef } from '@angular/material/table';
import { TableColumnsConfig } from './table-columns-config.provider';
import { TableApiWrapperService } from '../../../client/table/step-table-client.module';
import { TableColumnsDefinitionService } from './table-columns-definition.service';
import { map, Observable, of } from 'rxjs';
import { ColumnInfo } from '../types/column-info';
import { CustomCellApplySubPathPipe } from '../pipe/custom-cell-apply-sub-path.pipe';

enum VisibilityState {
  HIDDEN,
  VISIBLE,
}

export enum PlacePosition {
  LEFT = 'left',
  RIGHT = 'right',
}

@Injectable()
export class TableColumnsService {
  private _tableApi = inject(TableApiWrapperService);
  private _columnsConfig = inject(TableColumnsConfig, { optional: true });
  private _columnsDefinition = inject(TableColumnsDefinitionService);

  readonly hasConfig = !!this._columnsConfig;
  readonly remoteColumnsScreenId = this._columnsConfig?.entityScreenId;
  readonly entityScreenSubPath = this._columnsConfig?.entityScreenSubPath;

  private hasChangesInternal = signal(false);

  readonly hasChanges = this.hasChangesInternal.asReadonly();

  private settings = signal<TableSettings | undefined>(undefined);

  readonly hiddenColumns = computed(() =>
    this.prepareColumns(this.settings()?.columnSettingList, VisibilityState.HIDDEN),
  );
  readonly visibleColumns = computed(() =>
    this.prepareColumns(this.settings()?.columnSettingList, VisibilityState.VISIBLE),
  );

  initialize(): void {
    this.getTableSettings().subscribe((settings) => this.settings.set(settings));
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
      .subscribe(() => this.hasChangesInternal.set(false));
  }

  private getTableSettings(): Observable<TableSettings> {
    if (!this._columnsConfig?.entityTableRemoteId) {
      return of(this.getDefaultTableSettings());
    }
    return this._tableApi
      .getTableSettings(this._columnsConfig.entityTableRemoteId)
      .pipe(map((settings) => this.mergeSettings(settings, this.getDefaultTableSettings())));
  }

  private getDefaultTableSettings(): TableSettings {
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
      .map((col, i) => this.createStandardColumnSettings(col, i, infoDictionary));

    const remoteColumns = remoteColumnsDefinitions.map((screenInput, i) =>
      this.createScreenInputColumnSettings(screenInput, columnSettingList.length + i),
    );

    columnSettingList = [...columnSettingList, ...remoteColumns];

    const actionsColumns = actionColumnsDefinitions
      .reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[])
      .map((col, i) => this.createStandardColumnSettings(col, columnSettingList.length + i, infoDictionary));

    columnSettingList = [...columnSettingList, ...actionsColumns];

    return { columnSettingList };
  }

  private createStandardColumnSettings(
    matColDef: MatColumnDef,
    position: number,
    infoDictionary?: Record<string, ColumnInfo>,
  ): ColumnSettings {
    const info = infoDictionary?.[matColDef.name];
    const columnId = info?.columnId ?? matColDef.name;
    const visible = info ? !info.isHiddenByDefault : true;
    return {
      columnId,
      position,
      visible,
      type: 'step.plugins.table.settings.ColumnSettings',
    };
  }

  private createScreenInputColumnSettings(screenInput: ScreenInput, position: number): ScreenInputColumnSettings {
    return {
      columnId: CustomCellApplySubPathPipe.transform(screenInput.input!.id!, this.entityScreenSubPath),
      position,
      visible: false,
      type: 'step.plugins.table.settings.ScreenInputColumnSettings',
      screenInput,
    };
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
    const column = (tableSettings?.columnSettingList ?? []).find((col) => col.columnId === columnId);
    if (!column) {
      return;
    }
    column.visible = visibility === VisibilityState.VISIBLE;
    this.settings.set({ ...tableSettings });
    this.hasChangesInternal.set(true);
  }

  private mergeSettings(remoteSettings: TableSettings | undefined, defaultSettings: TableSettings): TableSettings {
    if (!remoteSettings) {
      return defaultSettings;
    }

    const defaultColumnKeys = new Set((defaultSettings.columnSettingList ?? []).map((col) => col.columnId));

    // Remove columns from settings, that was deleted
    remoteSettings.columnSettingList = (remoteSettings.columnSettingList ?? []).filter((col) =>
      defaultColumnKeys.has(col.columnId),
    );

    // Add new columns
    const removeColumnsKey = new Set(remoteSettings.columnSettingList.map((col) => col.columnId));
    const columnsToAdd = (defaultSettings.columnSettingList ?? []).filter((col) => !removeColumnsKey.has(col.columnId));

    remoteSettings.columnSettingList = remoteSettings.columnSettingList.concat(columnsToAdd);

    return remoteSettings;
  }
}
