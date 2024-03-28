import { Component, computed, HostBinding, HostListener, inject, ViewEncapsulation } from '@angular/core';
import { MatColumnDef } from '@angular/material/table';
import { TableColumnsService } from '../../services/table-columns.service';
import { TableColumnsDictionaryService } from '../../services/table-columns-dictionary.service';

@Component({
  selector: 'step-column-hide-button',
  templateUrl: './column-hide-button.component.html',
  styleUrl: './column-hide-button.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ColumnHideButtonComponent {
  private _matColDef = inject(MatColumnDef);
  private _tableColumns = inject(TableColumnsService);
  private _tableColumnsDictionary = inject(TableColumnsDictionaryService);

  @HostBinding('class.hidden')
  readonly disabled = !this._tableColumns.hasConfig;

  tooltipMessage = computed(() => {
    const columnId = this._matColDef.name;
    const name = this._tableColumnsDictionary.columnsDictionary()[columnId] ?? columnId;
    return `Hide column "${name}"`;
  });

  @HostListener('mousedown', ['$event'])
  hideColumn($event: MouseEvent): void {
    if ($event.button !== 0 || this.disabled) {
      return;
    }
    $event.preventDefault();
    $event.stopPropagation();
    $event.stopImmediatePropagation();

    const column = this._matColDef.name;
    this._tableColumns.hideColumn(column);
  }
}
