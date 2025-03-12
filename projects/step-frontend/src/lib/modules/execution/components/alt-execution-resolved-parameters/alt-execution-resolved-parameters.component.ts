import { Component, inject, input } from '@angular/core';
import { KeyValue } from '@angular/common';
import {
  AceMode,
  PopoverService,
  RichEditorDialogService,
  STORE_ALL,
  tablePersistenceConfigProvider,
  TablePersistenceStateService,
  TableStorageService,
} from '@exense/step-core';
import { TableMemoryStorageService } from '../../services/table-memory-storage.service';

@Component({
  selector: 'step-alt-execution-resolved-parameters',
  templateUrl: './alt-execution-resolved-parameters.component.html',
  styleUrl: './alt-execution-resolved-parameters.component.scss',
  providers: [
    {
      provide: TableStorageService,
      useClass: TableMemoryStorageService,
    },
    TablePersistenceStateService,
    tablePersistenceConfigProvider('resolvedParametersList', STORE_ALL),
  ],
})
export class AltExecutionResolvedParametersComponent {
  private _richEditorDialog = inject(RichEditorDialogService);
  private _popoverService = inject(PopoverService, { optional: true });

  readonly parameters = input<KeyValue<string, string>[]>([]);

  protected showParameter({ key, value }: KeyValue<string, string>): void {
    this._popoverService?.freezePopover();
    this._richEditorDialog
      .editText(value, {
        isReadOnly: true,
        title: key,
        predefinedMode: AceMode.TEXT,
        wrapText: true,
        filterEmptyResult: false,
      })
      .subscribe(() => this._popoverService?.unfreezePopover());
  }
}
