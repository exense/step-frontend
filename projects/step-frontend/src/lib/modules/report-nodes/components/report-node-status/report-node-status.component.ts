import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

type Status = ReportNode['status'];

@Component({
  selector: 'step-report-node-status',
  templateUrl: './report-node-status.component.html',
  styleUrls: ['./report-node-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportNodeStatusComponent {
  @Input() status?: Status;
}
