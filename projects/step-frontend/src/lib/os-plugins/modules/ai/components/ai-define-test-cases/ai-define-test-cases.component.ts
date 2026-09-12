import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { StepCoreModule } from '@exense/step-core';
import { AiGenerationInputType, AiTestCasesDraft } from '../../shared';

interface AiTestCaseFormControls {
  id: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string>;
  instructions: FormControl<string>;
}

type AiTestCaseForm = FormGroup<AiTestCaseFormControls>;

@Component({
  selector: 'step-ai-define-test-cases',
  imports: [StepCoreModule],
  templateUrl: './ai-define-test-cases.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiDefineTestCasesComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private nextTestCaseId = 0;

  readonly generationRequested = output<AiTestCasesDraft>();

  protected readonly form = this._formBuilder.group({
    testCases: this._formBuilder.array<AiTestCaseForm>([this.createTestCase()]),
    sharedInstructions: this._formBuilder.control('', { nonNullable: true }),
  });
  protected readonly testCases = this.form.controls.testCases;
  protected readonly requiredErrorDictionary: Record<string, string> = {
    required: 'This field is required.',
  };

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  protected addTestCase(): void {
    this.testCases.push(this.createTestCase());
    this.form.markAsDirty();
  }

  protected removeTestCase(index: number): void {
    if (this.testCases.length === 1) {
      return;
    }
    this.testCases.removeAt(index);
    this.form.markAsDirty();
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
      type: AiGenerationInputType.TEST_CASES,
      testCases: value.testCases.map((testCase) => {
        const instructions = testCase.instructions.trim();
        return {
          name: testCase.name.trim(),
          description: testCase.description.trim(),
          ...(!!instructions ? { instructions } : {}),
        };
      }),
      ...(!!sharedInstructions ? { sharedInstructions } : {}),
    });
  }

  private createTestCase(): AiTestCaseForm {
    this.nextTestCaseId += 1;
    return this._formBuilder.group({
      id: this._formBuilder.control(`test-case-${this.nextTestCaseId}`, { nonNullable: true }),
      name: this._formBuilder.control('', { nonNullable: true, validators: Validators.required }),
      description: this._formBuilder.control('', { nonNullable: true, validators: Validators.required }),
      instructions: this._formBuilder.control('', { nonNullable: true }),
    });
  }
}
