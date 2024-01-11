import { Component, OnDestroy, QueryList } from '@angular/core';
import { ColumnContainer } from '../../shared';
import { CustomColumnsBaseComponent, SearchColDirective } from '../../modules/table/table.module';
import { Observable, Subject } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';

@Component({
  template: '',
})
export abstract class BaseColumnContainerComponent implements ColumnContainer, CustomColumnsBaseComponent, OnDestroy {
  private columnsReadyInternal$ = new Subject<boolean>();

  colDef?: QueryList<MatColumnDef>;
  searchColDef?: QueryList<SearchColDirective>;

  readonly columnsReady$: Observable<boolean> = this.columnsReadyInternal$.asObservable();

  ngOnDestroy(): void {
    this.colDef = undefined;
    this.searchColDef = undefined;
    this.columnsReadyInternal$.complete();
  }

  initColumns(colDef?: QueryList<MatColumnDef>, searchColDef?: QueryList<SearchColDirective>): void {
    this.colDef = colDef;
    this.searchColDef = searchColDef;
    this.columnsReadyInternal$.next(true);
  }
}
