import { Component, Input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-wait-for-event',
  templateUrl: './wait-for-event.component.html',
  styleUrls: ['./wait-for-event.component.scss'],
})
export class WaitForEventComponent {
  @Input() node!: ReportNode | any;
}
