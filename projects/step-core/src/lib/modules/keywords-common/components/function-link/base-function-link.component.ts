import { Component, inject, Input } from '@angular/core';
import { map, of } from 'rxjs';
import { CustomComponent } from '../../../custom-registeries/custom-registries.module';
import { CustomColumnOptions } from '../../../table/table.module';
import { Keyword } from '../../../../client/step-client-module';
import { FunctionActionsService } from '../../injectables/function-actions.service';

@Component({
  template: '',
  standalone: false,
})
export abstract class BaseFunctionLinkComponent implements CustomComponent {
  protected _functionActions = inject(FunctionActionsService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  @Input() context?: Keyword;

  readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));

  abstract handleLinkClick(): void;
}
