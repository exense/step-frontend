import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypePDFTestForm } from '../../types/function-type-pdf-test.form';

@Component({
  selector: 'step-function-type-pdf-test',
  templateUrl: './function-type-pdf-test.component.html',
  styleUrls: ['./function-type-pdf-test.component.scss'],
})
export class FunctionTypePDFTestComponent implements CustomComponent {
  context?: FunctionTypePDFTestForm;
}
