import { Directive, Optional, Self } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { Observable, of } from 'rxjs';
import { SearchColDirective } from './search-col.directive';
import { CustomColumnsBaseComponent } from '../components/custom-columns/custom-columns-base.component';

@Directive({
  selector:
    '[matColumnDef]:not([internal]):not([stepAdditionalCol]),step-custom-columns,step-entity-column-container,step-lock-column-container',
})
export class ColumnDirective {
  constructor(
    @Self() @Optional() private _matColumnDef?: MatColumnDef,
    @Self() @Optional() private _customColumns?: CustomColumnsBaseComponent,
    @Self() @Optional() private _searchColumn?: SearchColDirective
  ) {}

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
}
