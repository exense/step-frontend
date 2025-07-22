import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'step-token-state',
  templateUrl: './token-state.component.html',
  styleUrls: ['./token-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TokenStateComponent {
  @Input() state!: string;
}
