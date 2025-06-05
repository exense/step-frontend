import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'step-execution-duration-simple',
  templateUrl: './execution-duration-simple.component.html',
  styleUrl: './execution-duration-simple.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ExecutionDurationSimpleComponent {
  readonly duration = input<number | undefined>(undefined);
  readonly isAverage = input(false);
}
