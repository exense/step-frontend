import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeAstraForm } from '../../types/function-type-astra.form';

@Component({
  selector: 'step-function-type-astra',
  templateUrl: './function-type-astra.component.html',
  styleUrls: ['./function-type-astra.component.scss'],
})
export class FunctionTypeAstraComponent implements CustomComponent {
  context?: FunctionTypeAstraForm;
}
