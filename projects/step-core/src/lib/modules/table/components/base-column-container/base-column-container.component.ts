import { Component, OnDestroy, QueryList } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { ColumnContainer } from '../../types/column-container';
import { CustomColumnsBaseComponent } from '../custom-columns/custom-columns-base.component';
import { SearchColDirective } from '../../directives/search-col.directive';
import { ColumnDefLabelDirective } from '../../directives/column-def-label.directive';

@Component({
  template: '',
})
export abstract class BaseColumnContainerComponent implements ColumnContainer, CustomColumnsBaseComponent, OnDestroy {
  private columnsReadyInternal$ = new Subject<boolean>();

  colDef?: QueryList<MatColumnDef>;
  searchColDef?: QueryList<SearchColDirective>;
  colDefLabel?: QueryList<ColumnDefLabelDirective>;

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
