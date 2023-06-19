import { QueryList } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { SearchColDirective } from '../modules/table/directives/search-col.directive';

export abstract class EntityColumnContainer {
  abstract initColumns(colDef?: QueryList<MatColumnDef>, searchColDef?: QueryList<SearchColDirective>): void;
}
