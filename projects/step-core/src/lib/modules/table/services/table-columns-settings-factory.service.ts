import { Injectable } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { ColumnInfo } from '../types/column-info';
import { ColumnSettings, ScreenInput, ScreenInputColumnSettings } from '../../../client/step-client-module';
import { CustomCellApplySubPathPipe } from '../pipe/custom-cell-apply-sub-path.pipe';
import { TableColumnsConfig } from './table-columns-config.provider';

@Injectable({
  providedIn: 'root',
})
export class TableColumnsSettingsFactoryService {
  createStandardColumnSettings(
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

  createScreenInputColumnSettings(
    screenInput: ScreenInput,
    position: number,
    config: TableColumnsConfig | undefined | null,
    visible: boolean,
  ): ScreenInputColumnSettings {
    return {
      columnId: CustomCellApplySubPathPipe.transform(screenInput.input!.id!, config?.entityScreenSubPath),
      position,
      visible,
      type: 'step.plugins.table.settings.ScreenInputColumnSettings',
      screenInput,
    };
  }
}
