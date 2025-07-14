import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'step-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  readonly progress = input.required<number>();
}
