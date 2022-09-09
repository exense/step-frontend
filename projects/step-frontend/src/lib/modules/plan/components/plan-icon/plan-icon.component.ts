import { Component } from '@angular/core';
import { CustomComponent, Plan } from '@exense/step-core';

@Component({
  selector: 'step-plan-icon',
  template: `<entity-icon *ngIf="context" [entity]="context!" entityName="plans"> </entity-icon>`,
  styleUrls: [],
})
export class PlanIconComponent implements CustomComponent {
  context?: Plan;
}
