import { Component, HostListener, inject, ViewEncapsulation } from '@angular/core';
import { WizardStepActionsService } from '../../injectables/wizard-step-actions.service';

@Component({
  selector: 'step-wizard-step',
  templateUrl: './wizard-step.component.html',
  styleUrls: ['./wizard-step.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class WizardStepComponent {
  private _actions = inject(WizardStepActionsService);

  @HostListener('keydown.enter')
  private handleKeyEnter(): void {
    this._actions.isLast ? this._actions.goFinish() : this._actions.goNext();
  }
}
