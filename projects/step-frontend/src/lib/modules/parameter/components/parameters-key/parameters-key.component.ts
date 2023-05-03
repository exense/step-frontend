import { Component, Optional } from '@angular/core';
import { CustomColumnOptions, CustomComponent, Parameter, TableReload } from '@exense/step-core';
import { map, of } from 'rxjs';
import { ParameterDialogsService } from '../../services/parameter-dialogs.service';

@Component({
  selector: 'step-parameters-key',
  templateUrl: './parameters-key.component.html',
  styleUrls: ['./parameters-key.component.scss'],
})
export class ParametersKeyComponent implements CustomComponent {
  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  context?: Parameter;

  constructor(
    private _parameterDialogs: ParameterDialogsService,
    @Optional() private _customColumnOptions?: CustomColumnOptions,
    @Optional() private _tableReload?: TableReload
  ) {}

  editParameter(): void {
    if (!this.context) {
      return;
    }
    this._parameterDialogs.editParameter(this.context).subscribe((parameter) => {
      if (this._tableReload && parameter) {
        this._tableReload.reload();
      }
    });
  }
}
