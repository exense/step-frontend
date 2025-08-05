import { Directive, EventEmitter, forwardRef, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { first, Observable, of } from 'rxjs';
import { WizardStepMeta } from '../types/wizard-step-meta.interface';
import { WizardStepLocalContext } from '../types/wizard-step-local-context.interface';
import { WIZARD_GLOBAL_CONTEXT } from '../injectables/wizard-global-context.token';
import { WIZARD_STEP_LOCAL_CONTEXT } from '../injectables/wizard-step-local-context.token';
import { WIZARD_STEP_TYPE } from '../injectables/wizard-step-type.token';
import { WIZARD_STEP_FORM } from '../injectables/wizard-step-form.token';
import { WizardGlobalContext } from '../types/wizard-global-context.interface';
import { WizardStepActionsService } from '../injectables/wizard-step-actions.service';
import { WIZARD_STEP_FORM_CONFIG } from '../injectables/wizard-step-form-config.token';
import { WIZARD_STEP_BEHAVIOR_CONFIG } from '../injectables/wizard-step-behavior-config.token';
import { WizardStepBehaviorConfig } from '../types/wizard-step-behavior-config.interface';
import { Mutable } from '../../basics/step-basics.module';

type FieldAccessor = Mutable<Pick<WizardContextConnectorDirective, 'stepForm' | 'isLast' | 'isFirst'>>;

@Directive({
  selector: '[stepWizardContextConnector]',
  exportAs: 'wizardContextConnector',
  providers: [
    {
      provide: WIZARD_STEP_LOCAL_CONTEXT,
      useExisting: forwardRef(() => WizardContextConnectorDirective),
    },
    {
      provide: WizardStepActionsService,
      useExisting: forwardRef(() => WizardContextConnectorDirective),
    },
    {
      provide: WIZARD_STEP_TYPE,
      useFactory: (localContext: WizardStepLocalContext) => localContext.meta?.step?.type,
      deps: [WIZARD_STEP_LOCAL_CONTEXT],
    },
    {
      provide: WIZARD_STEP_FORM,
      useFactory: (globalContext: WizardGlobalContext, stepType: string) => {
        return globalContext.wizardForm?.controls?.[stepType];
      },
      deps: [WIZARD_GLOBAL_CONTEXT, WIZARD_STEP_TYPE],
    },
    {
      provide: WIZARD_STEP_FORM_CONFIG,
      useFactory: ({ meta }: WizardStepLocalContext) => {
        return meta!.step.formConfig ? meta!.stepInjector.get(meta!.step.formConfig) : undefined;
      },
      deps: [WIZARD_STEP_LOCAL_CONTEXT],
    },
    {
      provide: WIZARD_STEP_BEHAVIOR_CONFIG,
      useFactory: ({ meta }: WizardStepLocalContext) => {
        return meta!.step.behaviorConfig ? meta!.stepInjector.get(meta!.step.behaviorConfig) : undefined;
      },
      deps: [WIZARD_STEP_LOCAL_CONTEXT],
    },
  ],
  standalone: false,
})
export class WizardContextConnectorDirective implements WizardStepLocalContext, WizardStepActionsService, OnChanges {
  private _globalContext = inject(WIZARD_GLOBAL_CONTEXT);

  @Input('stepWizardContextConnector') meta?: WizardStepMeta;
  @Input() index?: number;
  @Input() size?: number;

  @Output() next = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();
  @Output() closeWizard = new EventEmitter<void>();

  readonly stepForm?: FormGroup;
  readonly isFirst: boolean = false;
  readonly isLast: boolean = false;

  cancel(): void {
    this.closeWizard.emit();
  }

  goFinish(): void {
    this.canGoNext$.pipe(first()).subscribe((canFinish) => {
      if (canFinish) {
        this.finish.emit();
      }
    });
  }

  goNext(): void {
    this.canGoNext$.pipe(first()).subscribe((canGoNext) => {
      if (canGoNext) {
        this.next.emit();
      }
    });
  }

  goPrevious(): void {
    this.canGoPrevious$.pipe(first()).subscribe((canGoPrevious) => {
      if (canGoPrevious) {
        this.previous.emit();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cMeta = changes['meta'];
    if (cMeta?.previousValue !== cMeta?.currentValue || cMeta?.firstChange) {
      this.setupForm(cMeta?.currentValue);
    }

    const cIndex = changes['index'];
    const cSize = changes['size'];

    let index: number | undefined = undefined;
    let size: number | undefined = undefined;

    if (cIndex?.previousValue !== cIndex?.currentValue || cIndex?.firstChange) {
      index = cIndex?.currentValue;
    }

    if (cSize?.previousValue !== cSize?.currentValue || cSize?.firstChange) {
      size = cSize?.currentValue;
    }

    if (index !== undefined || size !== undefined) {
      this.determineFlags(index, size);
    }
  }

  private setupForm(meta?: WizardStepMeta) {
    const fieldAccessor = this as FieldAccessor;
    if (!meta) {
      fieldAccessor.stepForm = undefined;
      return;
    }

    fieldAccessor.stepForm = this._globalContext.wizardForm?.controls?.[meta.step.type] as FormGroup;
  }

  private determineFlags(index?: number, size?: number): void {
    index = index ?? this.index ?? -1;
    size = size ?? this.size ?? -1;
    const fieldAccessor = this as FieldAccessor;
    fieldAccessor.isFirst = index === 0;
    fieldAccessor.isLast = index === size - 1;
  }

  private get canGoNext$(): Observable<boolean> {
    return this.behaviorService?.canGoNext$ ?? of(true);
  }

  private get canGoPrevious$(): Observable<boolean> {
    return this.behaviorService?.canGoPrevious$ ?? of(true);
  }

  private get behaviorService(): WizardStepBehaviorConfig | undefined {
    const behaviorConfig = this.meta?.step.behaviorConfig;
    return behaviorConfig ? this.meta?.stepInjector.get(behaviorConfig) : undefined;
  }
}
