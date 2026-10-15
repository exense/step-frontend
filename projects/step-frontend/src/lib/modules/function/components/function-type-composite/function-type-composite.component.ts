import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FunctionTypeFormComponent } from '@exense/step-core';

@Component({
  selector: 'step-function-type-composite',
  templateUrl: './function-type-composite.component.html',
  styleUrls: ['./function-type-composite.component.scss'],
  standalone: false,
})
export class FunctionTypeCompositeComponent extends FunctionTypeFormComponent<FormGroup<Record<string, never>>> {
  private readonly _formBuilder = inject(FormBuilder);

  protected readonly formGroup = this._formBuilder.group({});

  // eslint-disable-next-line step-lint/component-public-fields -- Implements the public FunctionTypeFormComponent lifecycle contract.
  override setValueToForm(): void {}

  // eslint-disable-next-line step-lint/component-public-fields -- Called by FunctionConfigurationDialogComponent when saving.
  override setValueToModel(): void {}
}
