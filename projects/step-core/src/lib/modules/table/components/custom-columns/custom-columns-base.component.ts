import { QueryList } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { ColumnDefLabelDirective } from '../../directives/column-def-label.directive';
import { Observable } from 'rxjs';

export abstract class CustomColumnsBaseComponent {
  abstract colDef?: QueryList<MatColumnDef>;
  abstract colDefLabel?: QueryList<ColumnDefLabelDirective>;
  abstract searchColDef?: QueryList<SearchColDirective>;
  abstract readonly columnsReady$: Observable<boolean>;
}
