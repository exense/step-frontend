import { Component, inject, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
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
})
export class SelectPlanComponent implements ControlValueAccessor, OnDestroy {
  private _planDialogsService = inject(PlanDialogsService);

  @Input() showRequiredMarker?: boolean;
  @Input() withClearButton?: boolean;
  @Input() label = 'Plan';
  @Input() planFilter?: string;

  private onChange: OnChange = noop;
  private onTouch: OnTouch = noop;

  protected isDisabled: boolean = false;
  protected planValue?: Plan;

  constructor(readonly _ngControl: NgControl) {
    this._ngControl.valueAccessor = this;
  }

  ngOnDestroy(): void {
    this.onChange = noop;
    this.onTouch = noop;
  }

  selectPlan(): void {
    this._planDialogsService.selectPlan(this.planFilter).subscribe({
      next: (plan) => {
        this.planValue = plan;
        this.onChange(this.planValue);
      },
      complete: () => {
        this.onTouch();
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
    this.isDisabled = isDisabled;
  }

  writeValue(obj?: Plan): void {
    this.planValue = obj;
  }

  protected clear(): void {
    this.planValue = undefined;
    this.onChange(this.planValue);
  }
}
