import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { StepCoreModule } from '@exense/step-core';
import { AiGenerationInputType, AiSpecificationDraft } from '../../shared';

@Component({
  selector: 'step-ai-paste-specification',
  imports: [StepCoreModule],
  templateUrl: './ai-paste-specification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiPasteSpecificationComponent {
  private readonly _formBuilder = inject(FormBuilder);

  readonly generationRequested = output<AiSpecificationDraft>();

  protected readonly form = this._formBuilder.group({
    specification: this._formBuilder.control('', { nonNullable: true, validators: Validators.required }),
    sharedInstructions: this._formBuilder.control('', { nonNullable: true }),
  });
  protected readonly specificationControl = this.form.controls.specification;
  protected readonly requiredErrorDictionary: Record<string, string> = {
    required: 'Paste a specification to continue.',
  };

  private readonly specificationValue = toSignal(this.specificationControl.valueChanges, {
    initialValue: this.specificationControl.value,
  });

  protected readonly specificationLength = computed(() => this.specificationValue().length);

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const sharedInstructions = value.sharedInstructions.trim();
    this.generationRequested.emit({
      type: AiGenerationInputType.SPECIFICATION,
      specification: value.specification.trim(),
      ...(!!sharedInstructions ? { sharedInstructions } : {}),
    });
  }
}
