import { Component, Input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-retry-if-fail',
  templateUrl: './retry-if-fail.component.html',
  styleUrls: ['./retry-if-fail.component.scss'],
})
export class RetryIfFailComponent {
  @Input() node!: ReportNode | any;
}
