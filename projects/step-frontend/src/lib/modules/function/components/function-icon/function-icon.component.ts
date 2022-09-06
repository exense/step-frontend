import { Component } from '@angular/core';
import { Function as KeywordFunction } from '@exense/step-core';

@Component({
  selector: 'step-function-icon',
  template: `<entity-icon *ngIf="context" [entity]="context!" entityName="functions"> </entity-icon>`,
  styleUrls: [],
})
export class FunctionIconComponent {
  context?: KeywordFunction;
}
