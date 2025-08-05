import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenGroupCapacity } from '@exense/step-core';

@Component({
  selector: 'step-status-summary',
  templateUrl: './status-summary.component.html',
  styleUrls: ['./status-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StatusSummaryComponent {
  @Input() tokenGroup!: TokenGroupCapacity;
}
