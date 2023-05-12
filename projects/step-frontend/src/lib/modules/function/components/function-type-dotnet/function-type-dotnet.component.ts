import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeDotnetForm } from '../../types/function-type-dotnet.form';

@Component({
  selector: 'step-function-type-dotnet',
  templateUrl: './function-type-dotnet.component.html',
  styleUrls: ['./function-type-dotnet.component.scss'],
})
export class FunctionTypeDotnetComponent implements CustomComponent {
  context?: FunctionTypeDotnetForm;
}
