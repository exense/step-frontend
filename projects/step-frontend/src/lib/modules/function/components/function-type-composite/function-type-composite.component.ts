import { Component } from '@angular/core';
import { FunctionTypeFormComponent } from '@exense/step-core';

@Component({
  selector: 'step-function-type-composite',
  templateUrl: './function-type-composite.component.html',
  styleUrls: ['./function-type-composite.component.scss'],
  standalone: false,
})
export class FunctionTypeCompositeComponent extends FunctionTypeFormComponent<any> {
  protected formGroup: any;

  override setValueToForm(): void {}

  override setValueToModel(): void {}
}
