import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BigNumberPipe, STATUS_COLORS } from '@exense/step-core';
import { Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-status-count-badge',
  templateUrl: './status-count-badge.component.html',
  styleUrl: './status-count-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BigNumberPipe],
})
export class StatusCountBadgeComponent {
  private _statusColors = inject(STATUS_COLORS);
  private _bigNumberPipe = inject(BigNumberPipe);

  /** @Input() **/
  readonly status = input<string | undefined>();

  /** @Input() **/
  readonly count = input(0);

  protected readonly color = computed(() => {
    const status = this.status();
    return (status ? this._statusColors[status as Status] : undefined) ?? this._statusColors['TECHNICAL_ERROR'];
  });

  protected readonly tooltip = computed(() => {
    const status = this.status();
    const count = this.count();

    const countFormatted = this._bigNumberPipe.transform(count);
    return status ? `${status}: ${countFormatted}` : countFormatted;
  });
}
