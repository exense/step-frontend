import { Component, computed, inject } from '@angular/core';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'step-column-add-button',
  templateUrl: './column-add-button.component.html',
  styleUrl: './column-add-button.component.scss',
})
export class ColumnAddButtonComponent {
  private _tableColumns = inject(TableColumnsService);
  private _tableColumnsDictionary = inject(TableColumnsDictionaryService);

  readonly hiddenColumns = computed(() => {
    const columns = this._tableColumns.hiddenColumns();
    const dictionary = this._tableColumnsDictionary.columnsDictionary();
    return columns.map(
      (key) =>
        ({
          key,
          value: dictionary[key] ?? key,
        }) as KeyValue<string, string>,
    );
  });

  readonly canAdd = computed(() => !!this.hiddenColumns().length);

  addColumn(column: string): void {
    this._tableColumns.showColumn(column);
  }
}
