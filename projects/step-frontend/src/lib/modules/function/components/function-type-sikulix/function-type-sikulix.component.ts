import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeSikulixForm } from '../../types/function-type-sikulix.form';

@Component({
  selector: 'step-function-type-sikulix',
  templateUrl: './function-type-sikulix.component.html',
  styleUrls: ['./function-type-sikulix.component.scss'],
})
export class FunctionTypeSikulixComponent implements CustomComponent {
  context?: FunctionTypeSikulixForm;
}
