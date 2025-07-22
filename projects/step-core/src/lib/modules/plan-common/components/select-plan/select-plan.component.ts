import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { PlanDialogsService } from '../../injectables/plan-dialogs.service';
import { Plan } from '../../../../client/step-client-module';
import { StepBasicsModule } from '../../../basics/step-basics.module';

type OnChange = (value?: Plan) => void;
type OnTouch = () => void;

@Component({
  selector: 'step-select-plan',
  templateUrl: './select-plan.component.html',
  styleUrls: ['./select-plan.component.scss'],
  imports: [StepBasicsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPlanComponent implements ControlValueAccessor {
  private _planDialogsService = inject(PlanDialogsService);

  readonly showRequiredMarker = input(false);
  readonly withClearButton = input(false);
  readonly label = input('Plan');
  readonly planFilter = input<string | undefined>(undefined);
  readonly errorsDictionary = input<Record<string, string> | undefined>(undefined);

  private onChange?: OnChange;
  private onTouch?: OnTouch;

  protected readonly isDisabled = signal(false);
  protected readonly planValue = signal<Plan | undefined>(undefined);

  protected readonly planName = computed(() => this.planValue()?.attributes?.['name'] ?? '');
  protected readonly showClearButton = computed(() => {
    const withClearButton = this.withClearButton();
    const hasPlanName = !!this.planName();
    return withClearButton && hasPlanName;
  });

  constructor(protected readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  selectPlan(): void {
    this._planDialogsService.selectPlan(this.planFilter()).subscribe({
      next: (plan) => {
        this.planValue.set(plan);
        this.onChange?.(plan);
      },
      complete: () => {
        this.onTouch?.();
      },
    });
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: OnTouch): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  writeValue(plan?: Plan): void {
    this.planValue.set(plan);
  }

  protected clear(): void {
    this.planValue.set(undefined);
    this.onChange?.(undefined);
  }
}
