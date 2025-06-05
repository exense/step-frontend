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
  standalone: false,
})
export class DragColumnCaptionComponent implements AfterViewInit {
  private _elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private _render = inject(Renderer2);
  private _dragService = inject(DragDataService, { optional: true });
  private _tableColumns = inject(TableColumnsService);
  private _destroyRef = inject(DestroyRef);
  readonly _matColDef = inject(MatColumnDef);

  readonly dragAllowed = !!this._dragService;

  private tableRef?: HTMLTableElement | null;
  private dragColumnClass?: string;
  private dragOverColumnLeftClass?: string;
  private dragOverColumnRightClass?: string;

  ngAfterViewInit(): void {
    this.determineTableRef();
    this.determineDragDropColumnClasses();
    this.setupDragBehavior();
  }

  handleDragOverLeft(): void {
    if (this.tableRef && this.dragOverColumnLeftClass) {
      this._render.addClass(this.tableRef, this.dragOverColumnLeftClass);
    }
  }

  handleDragLeaveLeft(): void {
    if (this.tableRef && this.dragOverColumnLeftClass) {
      this._render.removeClass(this.tableRef, this.dragOverColumnLeftClass);
    }
  }

  handleDropLeft(dropInfo: DropInfo): void {
    this._tableColumns.moveColumn(
      dropInfo.draggedElement as string,
      dropInfo.droppedArea as string,
      PlacePosition.LEFT,
    );
  }

  handleDragOverRight(): void {
    if (this.tableRef && this.dragOverColumnRightClass) {
      this._render.addClass(this.tableRef, this.dragOverColumnRightClass);
    }
  }

  handleDragLeaveRight(): void {
    if (this.tableRef && this.dragOverColumnRightClass) {
      this._render.removeClass(this.tableRef, this.dragOverColumnRightClass);
    }
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

  private determineDragDropColumnClasses(): void {
    const cell = this.getCell();
    if (!cell) {
      return;
    }

    this.dragColumnClass = `drag-col-${cell.cellIndex + 1}`;
    this.dragOverColumnLeftClass = `drag-over-col-left-${cell.cellIndex + 1}`;
    this.dragOverColumnRightClass = `drag-over-col-right-${cell.cellIndex + 1}`;
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
        filter(() => !!this.tableRef),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        if (this.dragColumnClass) {
          this._render.removeClass(this.tableRef, this.dragColumnClass);
        }
        if (this.dragOverColumnLeftClass) {
          this._render.removeClass(this.tableRef, this.dragOverColumnLeftClass);
        }
        if (this.dragOverColumnRightClass) {
          this._render.removeClass(this.tableRef, this.dragOverColumnRightClass);
        }
      });
  }
}
