import { Component, computed, effect, inject } from '@angular/core';
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
})
export class ColumnSettingsComponent {
  private _tableColumns = inject(TableColumnsService);
  private _tableColumnsDictionary = inject(TableColumnsDictionaryService);

  readonly hasChanges = this._tableColumns.hasChanges;

  eff = effect(() => {
    console.log('DICT', this._tableColumnsDictionary.columnsDictionary());
  });

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

  saveSettings(): void {
    this._tableColumns.saveSettingsForScope();
  }
}
