import { Component, Input } from '@angular/core';
import { CustomComponent, Parameter, DateFormat } from '@exense/step-core';

@Component({
  selector: 'step-parameter-last-modification',
  templateUrl: './parameter-last-modification.component.html',
  styleUrls: [],
  standalone: false,
})
export class ParameterLastModificationComponent implements CustomComponent {
  @Input() context?: Parameter;
  readonly DateFormat = DateFormat;
}
