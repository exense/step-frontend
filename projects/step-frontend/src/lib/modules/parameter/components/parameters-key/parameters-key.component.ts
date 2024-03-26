import { Component, inject } from '@angular/core';
import { CustomColumnOptions, CustomComponent, Parameter } from '@exense/step-core';
import { map, of } from 'rxjs';

@Component({
  selector: 'step-parameters-key',
  templateUrl: './parameters-key.component.html',
  styleUrls: ['./parameters-key.component.scss'],
})
export class ParametersKeyComponent implements CustomComponent {
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });
  private readonly options$ = this._customColumnOptions?.options$ ?? of([]);

  readonly noLink$ = this.options$.pipe(map((options) => options.includes('noEditorLink')));

  readonly noDescriptionHint$ = this.options$.pipe(map((options) => options.includes('noDescriptionHint')));

  context?: Parameter;
}
