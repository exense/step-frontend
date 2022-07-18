import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TokenGroupCapacity } from '@exense/step-core';

@Component({
  selector: 'step-token-state-progressbar',
  templateUrl: './token-state-progressbar.component.html',
  styleUrls: ['./token-state-progressbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenStateProgressbarComponent {
  @Input() tokenGroup!: TokenGroupCapacity;

  constructor() {}
}
