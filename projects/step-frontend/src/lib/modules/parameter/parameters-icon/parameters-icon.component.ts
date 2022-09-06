import { Component } from '@angular/core';
import { CustomComponent, Parameter } from '@exense/step-core';

@Component({
  selector: 'step-parameters-icon',
  template: `<entity-icon *ngIf="context" [entity]="context!" entityName="parameters"> </entity-icon>`,
  styleUrls: [],
})
export class ParametersIconComponent implements CustomComponent {
  context?: Parameter;
}
