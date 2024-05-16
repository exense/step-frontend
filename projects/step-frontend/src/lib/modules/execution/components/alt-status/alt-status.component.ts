import { Component, input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-alt-status',
  templateUrl: './alt-status.component.html',
  styleUrl: './alt-status.component.scss',
})
export class AltStatusComponent {
  status = input.required<ReportNode['status']>();
}
