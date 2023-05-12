import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeCompositeForm } from '../../types/function-type-composite.form';

@Component({
  selector: 'step-function-type-composite',
  templateUrl: './function-type-composite.component.html',
  styleUrls: ['./function-type-composite.component.scss'],
})
export class FunctionTypeCompositeComponent implements CustomComponent {
  context?: FunctionTypeCompositeForm;
}
