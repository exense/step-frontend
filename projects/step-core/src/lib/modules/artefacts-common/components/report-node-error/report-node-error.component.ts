import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReportNode } from '../../../../client/step-client-module';
import { ReportNodeIconComponent } from '../report-node-icon/report-node-icon.component';

type Node = ReportNode & { message?: string };

@Component({
  selector: 'step-report-node-error',
  templateUrl: './report-node-error.component.html',
  styleUrl: './report-node-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReportNodeIconComponent],
  standalone: true,
})
export class ReportNodeErrorComponent {
  /** @Input() **/
  readonly node = input<Node | undefined>();
}
