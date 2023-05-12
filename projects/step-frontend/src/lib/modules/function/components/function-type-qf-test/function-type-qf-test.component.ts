import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeQFTestForm } from '../../types/function-type-qf-test.form';

@Component({
  selector: 'step-function-type-qf-test',
  templateUrl: './function-type-qf-test.component.html',
  styleUrls: ['./function-type-qf-test.component.scss'],
})
export class FunctionTypeQFTestComponent implements CustomComponent {
  context?: FunctionTypeQFTestForm;
}
