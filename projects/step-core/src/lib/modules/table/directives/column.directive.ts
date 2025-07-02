import { Directive, inject } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { SearchColDirective } from './search-col.directive';
import { CustomColumnsBaseComponent } from '../components/custom-columns/custom-columns-base.component';
import { ActivityColDirective } from './activity-col.directive';
import { ColumnInfo } from '../types/column-info';
import { ActionColDirective } from './action-col.directive';

@Directive({
  selector:
    '[matColumnDef]:not([internal]):not([stepAdditionalCol]),step-custom-columns,step-entity-column-container,step-lock-column-container',
  standalone: false,
})
export class ColumnDirective {
  private _matColumnDef = inject(MatColumnDef, { self: true, optional: true });
  private _customColumns = inject(CustomColumnsBaseComponent, { self: true, optional: true });
  private _searchColumn = inject(SearchColDirective, { self: true, optional: true });
  private _colLabel = inject(ActivityColDirective, { self: true, optional: true });
  private _actionCol = inject(ActionColDirective, { self: true, optional: true });

  get isCustom(): boolean {
    return !!this._customColumns;
  }

  get isActionColumn(): boolean {
    return !!this._actionCol;
  }

  get ready$(): Observable<unknown> {
    return !this.isCustom ? of(true) : this._customColumns?.columnsReady$!;
  }

  get columnDefinitions(): MatColumnDef[] {
    return !this.isCustom ? [this._matColumnDef!].filter((x) => !!x) : this._customColumns!.colDef?.map((x) => x) ?? [];
  }

  get searchColumnDefinitions(): SearchColDirective[] {
    const searchCols = !this.isCustom
      ? [this._searchColumn!].filter((x) => !!x)
      : this._customColumns!.searchColDef?.map((x) => x) ?? [];

    return searchCols.filter((col) => !col.isSearchDisabled);
  }

  get columnInfos(): ColumnInfo[] {
    if (!this.isCustom) {
      return [this._colLabel?.columnInfo()!].filter((item) => !!item);
    }
    return (this._customColumns?.colDefLabel ?? []).map((item) => item.columnInfo()).filter((item) => !!item);
  }
}
