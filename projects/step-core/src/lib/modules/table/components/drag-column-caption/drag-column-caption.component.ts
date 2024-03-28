import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { DragDataService, DropInfo } from '../../../drag-drop';
import { PlacePosition, TableColumnsService } from '../../services/table-columns.service';

@Component({
  selector: 'step-drag-column-caption',
  templateUrl: './drag-column-caption.component.html',
  styleUrl: './drag-column-caption.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DragColumnCaptionComponent {
  private _tableColumns = inject(TableColumnsService);
  readonly _matColDef = inject(MatColumnDef);
  readonly _dragAllowed = !!inject(DragDataService, { optional: true });

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
}
