import { computed, inject, Injectable, signal } from '@angular/core';
import { ColumnSettings, ScreenInputColumnSettings, TableSettings } from '../../../client/generated';
import { MatColumnDef } from '@angular/material/table';
import { TableColumnsConfig } from './table-columns-config.provider';
import { TableApiWrapperService } from '../../../client/table/step-table-client.module';
import { TableColumnsDefinitionService } from './table-columns-definition.service';
import { map, Observable, of, tap } from 'rxjs';

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
    this.changeColumnVisibilityState(columnId, VisibilityState.VISIBLE).subscribe();
  }

  hideColumn(columnId: string): void {
    if (this.hiddenColumns().includes(columnId)) {
      return;
    }
    this.changeColumnVisibilityState(columnId, VisibilityState.HIDDEN).subscribe();
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

    this._tableApi
      .saveTableSettings(this._columnsConfig?.entityTableRemoteId!, { tableSettings: settings, scope: [] })
      .subscribe(() => this.settings.set({ ...settings }));
  }

  private getTableSettings(): Observable<TableSettings> {
    if (!this._columnsConfig?.entityTableRemoteId) {
      return of(this.getDefaultTableSettings());
    }
    return this._tableApi
      .getTableSettings(this._columnsConfig.entityTableRemoteId)
      .pipe(map((settings) => settings ?? this.getDefaultTableSettings()));
  }

  private getDefaultTableSettings(): TableSettings {
    const standardColumns = (this._columnsDefinition.contentColumns?.() ?? [])
      .reduce((res, col) => [...res, ...col.columnDefinitions], [] as MatColumnDef[])
      .map(
        (col, i) =>
          ({
            columnId: col.name,
            position: i,
            visible: true,
            type: 'step.plugins.table.settings.ColumnSettings',
          }) as ColumnSettings,
      );

    const remoteColumns = (this._columnsDefinition.customRemoteColumns?.()?.displayColumns() ?? []).map(
      (screenInput, i) =>
        ({
          columnId: screenInput.input!.id,
          position: standardColumns.length + i,
          visible: false,
          type: 'step.plugins.table.settings.ScreenInputColumnSettings',
          screenInput,
        }) as ScreenInputColumnSettings,
    );

    return {
      columnSettingList: standardColumns.concat(remoteColumns),
    };
  }

  private prepareColumns(columns: ColumnSettings[] = [], visibility: VisibilityState): string[] {
    const cols = columns.filter((col) => (visibility === VisibilityState.VISIBLE ? col.visible : !col.visible));
    cols.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return cols.map((col) => col.columnId!);
  }

  private changeColumnVisibilityState(columnId: string, visibility: VisibilityState): Observable<void> {
    if (!this._columnsConfig?.entityTableRemoteId) {
      return of(undefined);
    }
    const tableSettings = this.settings();
    const column = (tableSettings?.columnSettingList ?? []).find((col) => col.columnId === columnId);
    if (!column) {
      return of(undefined);
    }
    column.visible = visibility === VisibilityState.VISIBLE;
    return this._tableApi
      .saveTableSettings(this._columnsConfig!.entityTableRemoteId, { tableSettings, scope: [] })
      .pipe(
        tap(() => this.settings.set({ ...tableSettings })),
        map(() => {}),
      );
  }
}
