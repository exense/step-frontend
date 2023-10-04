import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Keyword } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../../table/table.module';
import { FunctionActionsService } from '../../injectables/function-actions.service';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  private _functionActions = inject(FunctionActionsService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });

  @Input() context?: Keyword;
  @Output() edit = new EventEmitter<void>();

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  editFunction(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }
    this._functionActions.openFunctionEditor(this.context).subscribe((continueEdit) => {
      if (continueEdit) {
        this.edit.emit();
      }
    });
  }
}
