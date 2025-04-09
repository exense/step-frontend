import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'step-alt-execution-duration',
  templateUrl: './alt-execution-duration.component.html',
  styleUrl: './alt-execution-duration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltExecutionDurationComponent {
  readonly duration = input<number | undefined>(undefined);
  readonly isAverage = input(false);
}
