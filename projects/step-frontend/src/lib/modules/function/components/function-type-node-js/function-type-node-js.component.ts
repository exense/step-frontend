import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeNodeJSForm } from '../../types/function-type-node-js.form';

@Component({
  selector: 'step-function-type-node-js',
  templateUrl: './function-type-node-js.component.html',
  styleUrls: ['./function-type-node-js.component.scss'],
})
export class FunctionTypeNodeJSComponent implements CustomComponent {
  context?: FunctionTypeNodeJSForm;
}
