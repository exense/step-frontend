import { Component, forwardRef, Input, OnDestroy, QueryList } from '@angular/core';
import { CustomColumnsBaseComponent, SearchColDirective } from '../../modules/table/table.module';
import { Observable, Subject } from 'rxjs';
import { MatColumnDef } from '@angular/material/table';
import { EntityColumnContainer } from '../../shared';

@Component({
  selector: 'step-entity-column-container',
  templateUrl: './entity-column-container.component.html',
  styleUrls: ['./entity-column-container.component.scss'],
  providers: [
    {
      provide: EntityColumnContainer,
      useExisting: forwardRef(() => EntityColumnContainerComponent),
    },
    {
      provide: CustomColumnsBaseComponent,
      useExisting: forwardRef(() => EntityColumnContainerComponent),
    },
  ],
})
export class EntityColumnContainerComponent implements EntityColumnContainer, CustomColumnsBaseComponent, OnDestroy {
  private columnsReadyInternal$ = new Subject<boolean>();

  @Input() entityName!: string;

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
