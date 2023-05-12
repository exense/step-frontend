import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeJMeterForm } from '../../types/function-type-jmeter.form';

@Component({
  selector: 'step-function-type-jmeter',
  templateUrl: './function-type-jmeter.component.html',
  styleUrls: ['./function-type-jmeter.component.scss'],
})
export class FunctionTypeJMeterComponent implements CustomComponent {
  context?: FunctionTypeJMeterForm;
}
