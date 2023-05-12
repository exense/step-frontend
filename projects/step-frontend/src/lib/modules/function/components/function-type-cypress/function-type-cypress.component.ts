import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeCypressForm } from '../../types/function-type-cypress.form';

@Component({
  selector: 'step-function-type-cypress',
  templateUrl: './function-type-cypress.component.html',
  styleUrls: ['./function-type-cypress.component.scss'],
})
export class FunctionTypeCypressComponent implements CustomComponent {
  context?: FunctionTypeCypressForm;
}
