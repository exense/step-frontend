import { QueryList } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../../directives/search-col.directive';
import { ActivityColDirective } from '../../directives/activity-col.directive';
import { Observable } from 'rxjs';

export abstract class CustomColumnsBaseComponent {
  abstract colDef?: QueryList<MatColumnDef>;
  abstract colDefLabel?: QueryList<ActivityColDirective>;
  abstract searchColDef?: QueryList<SearchColDirective>;
  abstract readonly columnsReady$: Observable<boolean>;
}
