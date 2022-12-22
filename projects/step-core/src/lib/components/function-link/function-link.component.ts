import { Component, Input, Optional } from '@angular/core';
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
