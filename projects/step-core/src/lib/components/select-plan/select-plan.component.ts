import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Plan } from '../../client/step-client-module';
import { PlanDialogsService } from '../../services/plan-dialogs.service';

@Component({
  selector: 'step-select-plan',
  templateUrl: './select-plan.component.html',
  styleUrls: ['./select-plan.component.scss'],
})
export class SelectPlanComponent {
  @Input() planNameControl!: FormControl<string | null>;
  @Input() disabled?: boolean;

  @Output() planSelected = new EventEmitter<Plan>();

  constructor(private _planDialogsService: PlanDialogsService) {}

  selectPlan(): void {
    this._planDialogsService.selectPlan().subscribe({
      next: (plan) => {
        this.planSelected.emit(plan);
      },
      error: () => {
        this.planNameControl.markAsTouched();
      },
    });
  }
}
