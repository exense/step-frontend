import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { ColumnInfo } from '../../types/column-info';

interface Column extends Omit<ColumnInfo, 'canHide'> {
  isVisible: boolean;
}

@Component({
  selector: 'step-column-settings',
  templateUrl: './column-settings.component.html',
  styleUrl: './column-settings.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ColumnSettingsComponent {
  private _tableColumnsDictionary = inject(TableColumnsDictionaryService);
  readonly _tableColumns = inject(TableColumnsService);

  allowSaving = input<boolean>(true);

  readonly columns = computed(() => {
    const visibleColumns = new Set(this._tableColumns.visibleColumns());
    const columns = this._tableColumnsDictionary.columnsDictionary();
    return columns
      .filter((col) => col.canHide)
      .map(
        ({ columnId, caption }) =>
          ({
            columnId,
            caption,
            isVisible: visibleColumns.has(columnId),
          }) as Column,
      );
  });

  switchVisibility(column: Column): void {
    if (column.isVisible) {
      this._tableColumns.hideColumn(column.columnId);
    } else {
      this._tableColumns.showColumn(column.columnId);
    }
  }
}
