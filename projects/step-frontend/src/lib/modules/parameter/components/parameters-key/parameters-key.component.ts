import { Component, inject } from '@angular/core';
import { CustomColumnOptions, CustomComponent, Parameter } from '@exense/step-core';
import { map, of } from 'rxjs';
import { ParameterListLogicService } from '../../services/parameter-list-logic.service';

@Component({
  selector: 'step-parameters-key',
  templateUrl: './parameters-key.component.html',
  styleUrls: ['./parameters-key.component.scss'],
})
export class ParametersKeyComponent implements CustomComponent {
  private _logic = inject(ParameterListLogicService, { optional: true });
  private _customColumnOptions = inject(CustomColumnOptions, { optional: true });

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  context?: Parameter;

  editParameter(): void {
    if (!this.context || !this._logic) {
      return;
    }
    this._logic.editParameter(this.context);
  }
}
