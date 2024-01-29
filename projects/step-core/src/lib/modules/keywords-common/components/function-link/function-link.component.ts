import { Component } from '@angular/core';
import { Keyword } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';
import { BaseFunctionLinkComponent } from './base-function-link.component';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent extends BaseFunctionLinkComponent implements CustomComponent {
  override handleLinkClick(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }
    this.editFunction(this.context);
  }

  editFunction(keyword: Keyword): void {
    this._functionActions!.configureFunction2(keyword.id!);
  }
}
