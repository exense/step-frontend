import { Component, Optional, Input } from '@angular/core';
import { CustomColumnOptions, CustomComponent } from '@exense/step-core';
import { Function as KeywordFunction } from '@exense/step-core';
import { FunctionLinkDialogService } from './function-link-dialog.service';
import { map, of } from 'rxjs';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent implements CustomComponent {
  @Input() context?: KeywordFunction;

  readonly noLink$ = (this._customColumnOptions?.options$ || of([])).pipe(
    map((options) => options.includes('noEditorLink'))
  );

  constructor(
    @Optional() private _functionLinkDialogService?: FunctionLinkDialogService,
    @Optional() private _customColumnOptions?: CustomColumnOptions
  ) {}

  editFunction(): void {
    const id = this.context?.id;
    if (!id || !this._functionLinkDialogService) {
      return;
    }
    this._functionLinkDialogService.openFunctionEditor(id).subscribe();
  }
}
