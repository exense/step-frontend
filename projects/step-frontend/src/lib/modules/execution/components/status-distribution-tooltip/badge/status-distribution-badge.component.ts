import { Component, computed, inject, input } from '@angular/core';
import { STATUS_COLORS, StepBasicsModule } from '@exense/step-core';
import { Status } from '../../../../_common/shared/status.enum';

@Component({
  selector: 'step-status-distribution-badge',
  templateUrl: './status-distribution-badge.component.html',
  styleUrls: ['./status-distribution-badge.component.scss'],
  imports: [StepBasicsModule],
  standalone: true,
})
export class StatusDistributionBadgeComponent {
  private _statusColors = inject(STATUS_COLORS);

  status = input.required<string>();
  count = input.required<number>();
  percentage = input.required<number>();

  formattedPercentage = computed(() => {
    return this.percentage().toFixed(2);
  });

  protected readonly color = computed(() => {
    const status = this.status();
    return (status ? this._statusColors[status as Status] : undefined) ?? this._statusColors['TECHNICAL_ERROR'];
  });
}
