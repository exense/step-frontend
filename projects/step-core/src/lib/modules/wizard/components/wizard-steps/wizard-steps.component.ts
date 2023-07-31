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
import { WIZARD_GLOBAL_CONTEXT } from '../../injectables/wizard-global-context.token';
import { WizardStepMeta } from '../../types/wizard-step-meta.interface';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

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
})
export class WizardStepsComponent implements OnChanges, OnDestroy, WizardGlobalContext {
  private _terminator$ = new Subject<void>();
  private _wizardsRegistry = inject(WizardStepRegistryService);
  private _formBuilder = inject(FormBuilder);
  private _injector = inject(Injector);

  @ViewChild('stepper', { static: true })
  private _stepper!: MatStepper;

  @Input() steps: string[] = [];
  @Input() initialModel: any = {};

  @Output() finish = new EventEmitter<void>();

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
    this._terminator$.next();
    this._terminator$.complete();
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

  handleChange(event: StepperSelectionEvent): void {}

  protected finishWizard(): void {
    this.finish.emit();
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
      const providers: StaticProvider[] = [step?.formConfig, step?.behaviorConfig]
        .filter((item) => !!item)
        .map((item) => {
          return { provide: item! };
        });

      const stepInjector = Injector.create({
        providers,
        parent: this._injector,
      }) as EnvironmentInjector;

      return { step, stepInjector };
    });

    this.wizardForm = this.stepMetas.reduce((parentForm, { step, stepInjector }) => {
      if (!step.formConfig) {
        return parentForm;
      }
      const formConfig = stepInjector.get(step.formConfig);
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
}
