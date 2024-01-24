import { Component, inject, Injector } from '@angular/core';
import { Keyword } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';
import { TableReload } from '../../../table/table.module';
import { BaseFunctionLinkComponent } from './base-function-link.component';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
})
export class FunctionLinkComponent extends BaseFunctionLinkComponent implements CustomComponent {
  private _injector = inject(Injector);
  private _tableReload = inject(TableReload, { optional: true });

  override handleLinkClick(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }
    this.editFunction(this.context);
  }

  editFunction(keyword: Keyword): void {
    this._functionActions!.configureFunction(this._injector, keyword.id!).subscribe((keyword) => {
      if (keyword && this._tableReload) {
        this._tableReload.reload();
      }
    });
  }
}
