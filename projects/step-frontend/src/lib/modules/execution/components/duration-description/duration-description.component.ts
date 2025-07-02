import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DateFormat } from '@exense/step-core';

@Component({
  selector: 'step-duration-description',
  templateUrl: './duration-description.component.html',
  styleUrl: './duration-description.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DurationDescriptionComponent {
  readonly startTime = input<number | undefined>(undefined);
  readonly endTime = input<number | undefined>(undefined);
  readonly isRunning = input(false);
  protected readonly DateFormat = DateFormat;
}
