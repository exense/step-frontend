import { Component, Optional } from '@angular/core';
import { CustomColumnOptions, CustomComponent } from '@exense/step-core';
import { Function as KeywordFunction } from '@exense/step-core';
import { FunctionDialogsService } from '../../services/function-dialogs.service';
import { map, of } from 'rxjs';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  context?: KeywordFunction;

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  constructor(
    private _functionDialogs: FunctionDialogsService,
    @Optional() private _customColumnOptions?: CustomColumnOptions
  ) {}

  editFunction(): void {
    const id = this.context?.id;
    if (!id) {
      return;
    }
    this._functionDialogs.openFunctionEditor(id);
  }
}
