import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Function as KeywordFunction } from '../../client/step-client-module';
import { CustomComponent } from '../../modules/custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../modules/table/table.module';
import { FunctionLinkDialogService } from './function-link-dialog.service';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  private _functionLinkDialogService = inject(FunctionLinkDialogService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });

  @Input() context?: KeywordFunction;
  @Output() edit = new EventEmitter<void>();

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  editFunction(): void {
    if (!this.context?.id || !this._functionLinkDialogService) {
      return;
    }
    this._functionLinkDialogService.openFunctionEditor(this.context).subscribe((continueEdit) => {
      if (continueEdit) {
        this.edit.emit();
      }
    });
  }
}
