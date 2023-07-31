import { Directive, forwardRef, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { WizardStepMeta } from '../types/wizard-step-meta.interface';
import { WizardStepLocalContext } from '../types/wizard-step-local-context.interface';
import { WizardStepBehaviorService } from '../injectables/wizard-step-behavior.service';
import { WizardStepFormService } from '../injectables/wizard-step-form.service';
import { FormGroup } from '@angular/forms';
import { Mutable } from '../../../shared';
import { WIZARD_GLOBAL_CONTEXT } from '../injectables/wizard-global-context.token';
import { WIZARD_STEP_LOCAL_CONTEXT } from '../injectables/wizard-step-local-context.token';

type FieldAccessor = Mutable<Pick<WizardStepLocalContext, 'stepBehaviorService' | 'stepFormService' | 'stepForm'>>;
@Directive({
  selector: '[stepWizardLocalContext]',
  exportAs: 'wizardLocalContext',
  providers: [
    {
      provide: WIZARD_STEP_LOCAL_CONTEXT,
      useExisting: forwardRef(() => WizardLocalContextDirective),
    },
  ],
})
export class WizardLocalContextDirective implements WizardStepLocalContext, OnChanges {
  private _globalContext = inject(WIZARD_GLOBAL_CONTEXT);

  @Input('stepWizardLocalContext') meta?: WizardStepMeta;

  readonly stepBehaviorService?: WizardStepBehaviorService;
  readonly stepForm?: FormGroup;
  readonly stepFormService?: WizardStepFormService;

  ngOnChanges(changes: SimpleChanges): void {
    const cMeta = changes['meta'];
    if (cMeta?.previousValue !== cMeta?.currentValue || cMeta?.firstChange) {
      this.setupContext(cMeta?.currentValue);
    }
  }

  private setupContext(meta?: WizardStepMeta) {
    const fieldAccessor = this as FieldAccessor;
    if (!meta) {
      fieldAccessor.stepForm = undefined;
      fieldAccessor.stepFormService = undefined;
      fieldAccessor.stepBehaviorService = undefined;
      return;
    }

    fieldAccessor.stepForm = this._globalContext.wizardForm?.controls?.[meta.step.type] as FormGroup;
    fieldAccessor.stepFormService = meta.step.formConfig ? meta.stepInjector.get(meta.step.formConfig) : undefined;
    fieldAccessor.stepBehaviorService = meta.step.behaviorConfig
      ? meta.stepInjector.get(meta.step.behaviorConfig)
      : undefined;
  }
}
