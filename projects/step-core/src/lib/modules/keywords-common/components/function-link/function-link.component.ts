import { Component, inject } from '@angular/core';
import { Keyword } from '../../../../client/step-client-module';
import { CustomComponent } from '../../../custom-registeries/shared/custom-component';
import { BaseFunctionLinkComponent } from './base-function-link.component';
import { Router } from '@angular/router';
import { StepBasicsModule } from '../../../basics/step-basics.module';

@Component({
  selector: 'step-function-link',
  templateUrl: './function-link.component.html',
  styleUrls: ['./function-link.component.scss'],
  imports: [StepBasicsModule],
  standalone: true,
})
export class FunctionLinkComponent extends BaseFunctionLinkComponent implements CustomComponent {
  private _router = inject(Router);

  override handleLinkClick(): void {
    if (!this.context?.id || !this._functionActions) {
      return;
    }
    this.editFunction(this.context);
  }

  editFunction(keyword: Keyword): void {
    this._router.navigateByUrl(this._functionActions!.resolveConfigurerUrl(keyword));
  }
}
