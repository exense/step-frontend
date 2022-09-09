import { Component } from '@angular/core';
import { CustomComponent, ExecutiontTaskParameters } from '@exense/step-core';

@Component({
  selector: 'step-scheduler-icon',
  template: `<entity-icon *ngIf="context" [entity]="context!" entityName="tasks"> </entity-icon>`,
  styleUrls: [],
})
export class SchedulerIconComponent implements CustomComponent {
  context?: ExecutiontTaskParameters;
}
