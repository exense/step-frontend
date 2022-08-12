import { Component, Inject } from '@angular/core';
import { AJS_LOCATION, CustomComponent, Plan } from '@exense/step-core';
import { ILocationService } from 'angular';

@Component({
  selector: 'step-plan-link',
  templateUrl: './plan-link.component.html',
  styleUrls: ['./plank-link.component.scss'],
})
export class PlanLinkComponent implements CustomComponent {
  context?: Plan;

  constructor(@Inject(AJS_LOCATION) private _location: ILocationService) {}

  editPlan(): void {
    if (!this.context) {
      return;
    }
    this._location.path(`/root/plans/editor/${this.context.id}`);
  }
}
