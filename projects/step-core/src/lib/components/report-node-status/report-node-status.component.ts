import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ReportNode } from '../../client/step-client-module';

type Status = ReportNode['status'];

@Component({
  selector: 'step-report-node-status',
  templateUrl: './report-node-status.component.html',
  styleUrls: ['./report-node-status.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ReportNodeStatusComponent {
  @Input() status?: Status;
}
