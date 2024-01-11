import { Component, EventEmitter, inject, Injector, Input, Output } from '@angular/core';
import { map, of } from 'rxjs';
import { Keyword } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';
import { CustomColumnOptions, TableReload } from '../../../table/table.module';
import { FunctionActionsService } from '../../injectables/function-actions.service';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  private _functionActions = inject(FunctionActionsService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private _injector = inject(Injector);
  private _tableReload = inject(TableReload, { optional: true });

  @Input() context?: Keyword;
  @Input() openEditorOnClick?: boolean;
  @Output() edit = new EventEmitter<void>();

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  handleClick(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }

    if (this.openEditorOnClick) {
      this.openEditor(this.context);
    } else {
      this.editFunction(this.context);
    }
  }

  editFunction(keyword: Keyword): void {
    this._functionActions!.configureFunction(this._injector, keyword.id!).subscribe((keyword) => {
      if (keyword && this._tableReload) {
        this._tableReload.reload();
      }
    });
  }

  openEditor(keyword: Keyword): void {
    this._functionActions!.openFunctionEditor(keyword).subscribe((continueEdit) => {
      if (continueEdit) {
        this.edit.emit();
      }
    });
  }
}
