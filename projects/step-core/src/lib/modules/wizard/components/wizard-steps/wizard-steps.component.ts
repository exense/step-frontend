import {
  Component,
  EnvironmentInjector,
  EventEmitter,
  forwardRef,
  inject,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  StaticProvider,
  TrackByFunction,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { WizardStepRegistryService } from '../../injectables/wizard-step-registry.service';
import { WizardGlobalContext } from '../../types/wizard-global-context.interface';
import { WizardStepMeta } from '../../types/wizard-step-meta.interface';
import { MatStepper } from '@angular/material/stepper';
import { WIZARD_GLOBAL_CONTEXT } from '../../injectables/wizard-global-context.token';
import { WIZARD_STEP_TYPE } from '../../injectables/wizard-step-type.token';
import { WIZARD_STEP_FORM } from '../../injectables/wizard-step-form.token';
import { WIZARD_STEP_FORM_CONFIG } from '../../injectables/wizard-step-form-config.token';
import { WIZARD_STEP_BEHAVIOR_CONFIG } from '../../injectables/wizard-step-behavior-config.token';
import { WizardStep } from '../../types/wizard-step.interface';

@Component({
  selector: 'step-wizard-steps',
  templateUrl: './wizard-steps.component.html',
  styleUrls: ['./wizard-steps.component.scss'],
  providers: [
    {
      provide: WIZARD_GLOBAL_CONTEXT,
      useExisting: forwardRef(() => WizardStepsComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class WizardStepsComponent implements OnChanges, OnDestroy, WizardGlobalContext {
  private _wizardsRegistry = inject(WizardStepRegistryService);
  private _formBuilder = inject(FormBuilder);
  private _injector = inject(Injector);

  @ViewChild('stepper', { static: true })
  private _stepper!: MatStepper;

  @Input() steps: string[] = [];
  @Input() initialModel: any = {};

  @Output() finish = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  wizardForm?: FormGroup;
  model: any;

  stepMetas: WizardStepMeta[] = [];
  readonly trackByStepMeta: TrackByFunction<WizardStepMeta> = (index, item) => item.step.type;

  ngOnChanges(changes: SimpleChanges): void {
    let steps: string[] | undefined = undefined;
    let initialModel: any | undefined = undefined;

    const cSteps = changes['steps'];
    if (cSteps.previousValue !== cSteps.currentValue || cSteps.firstChange) {
      steps = cSteps.currentValue;
    }

    const cInitialModel = changes['initialModel'];
    if (cInitialModel.previousValue !== cInitialModel.currentValue || cInitialModel.firstChange) {
      initialModel = cInitialModel.currentValue;
    }

    this.setupWizardsContext(steps, initialModel);
  }

  ngOnDestroy(): void {
    this.disposeSteps();
  }

  updateModel(): void {
    this.stepMetas
      .filter((meta) => !!meta.step.formConfig)
      .forEach((meta) => {
        const formConfig = meta.stepInjector.get(meta.step.formConfig!);
        const form = this.wizardForm!.controls[meta.step.type] as FormGroup;
        formConfig.setFormToModel(this.model, form);
      });
  }

  protected finishWizard(): void {
    this.finish.emit();
  }

  protected closeWizard(): void {
    this.close.emit();
  }

  protected goNext(currentStepIndex: number): void {
    this.performStepEnterLeaveHooks(this.stepMetas[currentStepIndex], this.stepMetas[currentStepIndex + 1]);
    this._stepper.next();
  }

  protected goPrevious(currentStepIndex: number): void {
    this.performStepEnterLeaveHooks(this.stepMetas[currentStepIndex], this.stepMetas[currentStepIndex - 1]);
    this._stepper.previous();
  }

  private performStepEnterLeaveHooks(currentStep: WizardStepMeta, nextStep?: WizardStepMeta): void {
    const currentBehavior = currentStep.step.behaviorConfig
      ? currentStep.stepInjector.get(currentStep.step.behaviorConfig)
      : undefined;

    currentBehavior?.onLeave?.();

    if (!nextStep) {
      return;
    }

    const nextBehavior = nextStep.step.behaviorConfig
      ? nextStep.stepInjector.get(nextStep.step.behaviorConfig)
      : undefined;

    nextBehavior?.onEnter?.();
  }

  private setupWizardsContext(stepTypes?: string[], initialModel?: any): void {
    stepTypes = stepTypes ?? this.steps;
    initialModel = initialModel ?? this.initialModel;

    if (!stepTypes || stepTypes.length === 0 || !initialModel) {
      this.wizardForm = undefined;
      this.disposeSteps();
      this.stepMetas = [];
      return;
    }

    this.model = { ...initialModel };

    const steps = stepTypes.map((stepType) => this._wizardsRegistry.getStep(stepType)).filter((item) => !!item);

    this.stepMetas = steps.map((step) => {
      const stepInjector = this.createStepInjector(step);
      return { step, stepInjector };
    });

    this.wizardForm = this.stepMetas.reduce((parentForm, { step, stepInjector }) => {
      if (!step.formConfig) {
        return parentForm;
      }
      const formConfig = stepInjector.get(WIZARD_STEP_FORM_CONFIG);
      const subForm = formConfig.createStepForm();
      formConfig.setModelToForm(this.model, subForm);
      if (formConfig.setupFormBehavior) {
        formConfig.setupFormBehavior(subForm);
      }
      parentForm.addControl(step.type, subForm);
      return parentForm;
    }, this._formBuilder.group({}));
  }

  private disposeSteps(): void {
    this.stepMetas.forEach((item) => item.stepInjector.destroy());
  }

  private createStepInjector(step: WizardStep): EnvironmentInjector {
    const providers: StaticProvider[] = [];

    providers.push({
      provide: WIZARD_STEP_TYPE,
      useValue: step.type,
    });

    if (step.formConfig) {
      providers.push(
        {
          provide: step.formConfig,
        },
        {
          provide: WIZARD_STEP_FORM_CONFIG,
          useExisting: step.formConfig,
        },
        {
          provide: WIZARD_STEP_FORM,
          useFactory: (type: string, globalContext: WizardGlobalContext) => {
            const result = globalContext.wizardForm?.controls[type] ?? undefined;
            return result;
          },
          deps: [WIZARD_STEP_TYPE, WIZARD_GLOBAL_CONTEXT],
        },
      );
    }

    if (step.behaviorConfig) {
      providers.push(
        {
          provide: step.behaviorConfig,
        },
        {
          provide: WIZARD_STEP_BEHAVIOR_CONFIG,
          useExisting: step.behaviorConfig,
        },
      );
    }

    return Injector.create({ providers, parent: this._injector }) as EnvironmentInjector;
  }
}
