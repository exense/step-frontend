import { Component, input } from '@angular/core';
import { Operation } from '@exense/step-core';

@Component({
  selector: 'step-alt-report-current-operations',
  templateUrl: './alt-report-current-operations.component.html',
  styleUrl: './alt-report-current-operations.component.scss',
  standalone: false,
})
export class AltReportCurrentOperationsComponent {
  readonly operations = input<Operation[]>();
}
