import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReportNode } from '@exense/step-core';

type Node = ReportNode & { message?: string };

@Component({
  selector: 'step-report-node-error',
  templateUrl: './report-node-error.component.html',
  styleUrl: './report-node-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportNodeErrorComponent {
  readonly node = input<Node | undefined>();
}
