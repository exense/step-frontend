import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseReportDetailsComponent, ReportNode } from '@exense/step-core';

@Component({
  selector: 'step-empty-report-details',
  templateUrl: './empty-report-details.component.html',
  styleUrl: './empty-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyReportDetailsComponent extends BaseReportDetailsComponent<ReportNode> {}
