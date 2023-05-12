import { Component } from '@angular/core';
import { CustomComponent } from '@exense/step-core';
import { FunctionTypeCucumberForm } from '../../types/function-type-cucumber.form';

@Component({
  selector: 'step-function-type-cucumber',
  templateUrl: './function-type-cucumber.component.html',
  styleUrls: ['./function-type-cucumber.component.scss'],
})
export class FunctionTypeCucumberComponent implements CustomComponent {
  context?: FunctionTypeCucumberForm;
}
