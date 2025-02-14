import { Component, inject, input } from '@angular/core';
import { AceMode, RichEditorDialogService, TableDataSource, TimeSeriesErrorEntry } from '@exense/step-core';
import { EXECUTION_ENDED_STATUSES, Status } from '../../../_common/step-common.module';

@Component({
  selector: 'step-alt-execution-errors',
  templateUrl: './alt-execution-errors.component.html',
  styleUrl: './alt-execution-errors.component.scss',
})
export class AltExecutionErrorsComponent {
  private _richEditorDialogs = inject(RichEditorDialogService);

  /** @Input() **/
  readonly dataSource = input.required<TableDataSource<TimeSeriesErrorEntry>>();

  /** @Input() **/
  readonly showExecutionsMenu = input(true);

  /** @Input() **/
  readonly statusFilterItems = input(EXECUTION_ENDED_STATUSES, {
    transform: (items?: Status[] | null) => (!items?.length ? EXECUTION_ENDED_STATUSES : items) as Status[],
  });

  protected showError(errorMessage: string): void {
    this._richEditorDialogs.editText(errorMessage, {
      isReadOnly: true,
      title: 'Error message',
      predefinedMode: AceMode.TEXT,
      wrapText: true,
    });
  }
}
