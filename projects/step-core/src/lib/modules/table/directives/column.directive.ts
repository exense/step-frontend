import { Directive, inject } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { SearchColDirective } from './search-col.directive';
import { CustomColumnsBaseComponent } from '../components/custom-columns/custom-columns-base.component';
import { ColumnDefLabelDirective } from './column-def-label.directive';
import { KeyValue } from '@angular/common';

@Directive({
  selector:
    '[matColumnDef]:not([internal]):not([stepAdditionalCol]),step-custom-columns,step-entity-column-container,step-lock-column-container',
})
export class ColumnDirective {
  private _matColumnDef = inject(MatColumnDef, { self: true, optional: true });
  private _customColumns = inject(CustomColumnsBaseComponent, { self: true, optional: true });
  private _searchColumn = inject(SearchColDirective, { self: true, optional: true });
  private _colLabel = inject(ColumnDefLabelDirective, { self: true, optional: true });

  get isCustom(): boolean {
    return !!this._customColumns;
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

  get columnLabels(): KeyValue<string, string | undefined>[] {
    if (!this.isCustom) {
      return [this._colLabel?.getColumnIdAndLabel()!].filter((item) => !!item);
    }
    return (this._customColumns?.colDefLabel ?? []).map((item) => item.getColumnIdAndLabel()).filter((item) => !!item);
  }
}
