import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { TableColumnsMove } from '../../services/table-columns-move';
import { DragDataService, DropInfo } from '../../../drag-drop';

@Component({
  selector: 'step-drag-column-caption',
  templateUrl: './drag-column-caption.component.html',
  styleUrl: './drag-column-caption.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DragColumnCaptionComponent {
  private _tableColumnsMove = inject(TableColumnsMove);
  readonly _matColDef = inject(MatColumnDef);
  readonly _dragAllowed = !!inject(DragDataService, { optional: true });

  handleDropLeft(dropInfo: DropInfo): void {
    this._tableColumnsMove.moveColumn(dropInfo.draggedElement as string, dropInfo.droppedArea as string, 'left');
  }

  handleDropRight(dropInfo: DropInfo): void {
    this._tableColumnsMove.moveColumn(dropInfo.draggedElement as string, dropInfo.droppedArea as string, 'right');
  }
}
