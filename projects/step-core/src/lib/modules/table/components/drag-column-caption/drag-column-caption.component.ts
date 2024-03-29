import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { DragDataService, DropInfo } from '../../../drag-drop';
import { PlacePosition, TableColumnsService } from '../../services/table-columns.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map, switchMap, timer } from 'rxjs';
import { TableReload } from '../../services/table-reload';

@Component({
  selector: 'step-drag-column-caption',
  templateUrl: './drag-column-caption.component.html',
  styleUrl: './drag-column-caption.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DragColumnCaptionComponent implements AfterViewInit {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _cd = inject(ChangeDetectorRef);
  private _render = inject(Renderer2);
  private _dragService = inject(DragDataService, { optional: true });
  private _tableColumns = inject(TableColumnsService);
  private _destroyRef = inject(DestroyRef);
  private _tableReload = inject(TableReload);
  readonly _matColDef = inject(MatColumnDef);

  readonly dragAllowed = !!this._dragService;

  private tableRef?: HTMLTableElement | null;
  private dragColumnClass?: string;

  protected tableHeight?: string;
  protected readonly cellWidth = '10rem';

  ngAfterViewInit(): void {
    this.determineTableRef();
    this.determineDragColumnClass();
    this.setupDragBehavior();
    this.setupMeasurementsRecalculation();
    setTimeout(() => {
      this.recalculateMeasures();
    }, 100);
  }

  handleDropLeft(dropInfo: DropInfo): void {
    this._tableColumns.moveColumn(
      dropInfo.draggedElement as string,
      dropInfo.droppedArea as string,
      PlacePosition.LEFT,
    );
  }

  handleDropRight(dropInfo: DropInfo): void {
    this._tableColumns.moveColumn(
      dropInfo.draggedElement as string,
      dropInfo.droppedArea as string,
      PlacePosition.RIGHT,
    );
  }

  private determineTableRef(): void {
    this.tableRef = this._elRef.nativeElement.closest('table');
  }

  private getCell(): HTMLTableCellElement | null {
    return this._elRef.nativeElement.closest('th') ?? this._elRef.nativeElement.closest('td');
  }

  private determineDragColumnClass(): void {
    const cell = this.getCell();
    if (!cell) {
      return;
    }

    this.dragColumnClass = `drag-col-${cell.cellIndex + 1}`;
  }

  private recalculateMeasures(): void {
    const cell = this.getCell();
    if (!this.tableRef || !cell) {
      return;
    }
    this.tableHeight = this.tableRef?.getBoundingClientRect()?.height + 'px';
    this._cd.detectChanges();
  }

  private setupDragBehavior(): void {
    this._dragService?.dragStart$
      .pipe(
        filter(() => !!this.tableRef && !!this.dragColumnClass),
        map(() => this._dragService?.dragData),
        filter((dragData) => dragData === this._matColDef.name),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this._render.addClass(this.tableRef, this.dragColumnClass!));

    this._dragService?.dragEnd$
      .pipe(
        filter(() => !!this.tableRef && !!this.dragColumnClass),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this._render.removeClass(this.tableRef, this.dragColumnClass!));
  }

  private setupMeasurementsRecalculation(): void {
    this._tableReload.loadComplete$
      .pipe(
        switchMap(() => timer(100)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this.recalculateMeasures());
  }
}
