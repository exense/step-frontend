import { Component, inject } from '@angular/core';
import { WizardStepActionsService } from '../../injectables/wizard-step-actions.service';
import { WIZARD_STEP_BEHAVIOR_CONFIG } from '../../injectables/wizard-step-behavior-config.token';

@Component({
  selector: 'step-wizard-default-buttons',
  templateUrl: './wizard-default-buttons.component.html',
  styleUrls: ['./wizard-default-buttons.component.scss'],
  standalone: false,
})
export class WizardDefaultButtonsComponent {
  protected _actions = inject(WizardStepActionsService);
  protected _stepBehavior = inject(WIZARD_STEP_BEHAVIOR_CONFIG, { optional: true });
}
