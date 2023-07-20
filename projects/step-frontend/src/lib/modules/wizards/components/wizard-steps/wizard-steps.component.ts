import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { WizardStep, WizardStepMeta, WizardStepRegistryService } from '@exense/step-core';

@Component({
  selector: 'step-wizard-steps',
  templateUrl: './wizard-steps.component.html',
  styleUrls: ['./wizard-steps.component.scss'],
})
export class WizardStepsComponent implements OnChanges {
  private _wizardsRegistry = inject(WizardStepRegistryService);
  private _formBuilder = inject(FormBuilder).nonNullable;

  @Input() steps: WizardStep[] = [];
  @Output() finish = new EventEmitter<WizardStep[]>();

  protected wizardForm?: FormGroup;

  protected stepMetas: WizardStepMeta<WizardStep>[] = [];

  protected readonly trackByWizardStepMeta: TrackByFunction<WizardStepMeta<WizardStep>> = (index, item) => item.type;

  ngOnChanges(changes: SimpleChanges): void {
    const cSteps = changes['steps'];
    if (cSteps.previousValue !== cSteps.currentValue || cSteps.firstChange) {
      this.createWizardForm(cSteps.currentValue);
    }
  }

  protected finishWizard(): void {
    if (!this.wizardForm) {
      return;
    }
    if (this.wizardForm.invalid) {
      this.wizardForm.markAllAsTouched();
      return;
    }
    const resultSteps = this.steps.map((step) => ({ ...step } as WizardStep));
    resultSteps.forEach((step) => {
      const meta = this.stepMetas.find((meta) => meta.type === step.type);
      const form = this.wizardForm!.controls[step.type] as FormGroup;
      if (meta && form) {
        meta.setFormToModel(step, form);
      }
    });
    this.finish.emit(resultSteps);
  }

  private createWizardForm(steps?: WizardStep[]): void {
    if (!steps || steps.length === 0) {
      this.wizardForm = undefined;
      this.stepMetas = [];
      return;
    }
    const stepMetas = steps
      .map((step) => {
        const meta = this._wizardsRegistry.getStep(step.type);
        return { step, meta };
      })
      .filter((item) => !!item.meta);

    this.wizardForm = stepMetas.reduce((parentForm, { step, meta }) => {
      const subForm = meta!.createStepForm(this._formBuilder);
      meta!.setModelToForm(step, subForm);
      parentForm.addControl(meta!.type, subForm);
      return parentForm;
    }, this._formBuilder.group({}));

    this.stepMetas = stepMetas.map((item) => item.meta!);
  }
}
