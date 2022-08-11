import { Component, Input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-assert-report-node-short',
  templateUrl: './assert-report-node-short.component.html',
  styleUrls: ['./assert-report-node-short.component.scss'],
})
export class AssertReportNodeShortComponent {
  @Input() node?: ReportNode & { message?: string };
}
