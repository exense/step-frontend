import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeSoapUIForm } from '../../types/function-type-soap-ui.form';

@Component({
  selector: 'step-function-type-soap-ui',
  templateUrl: './function-type-soap-ui.component.html',
  styleUrls: ['./function-type-soap-ui.component.scss'],
})
export class FunctionTypeSoapUIComponent implements CustomComponent {
  context?: FunctionTypeSoapUIForm;
}
