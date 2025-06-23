import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Status } from '../../../_common/shared/status.enum';

type CountByStatus = Record<string, number>;

export interface StatusItem {
  status: Status;
  className: string;
  count: number;
  tooltipMessage: string;
}

@Component({
  selector: 'step-aggregated-status',
  templateUrl: './aggregated-status.component.html',
  styleUrl: './aggregated-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregatedStatusComponent {
  readonly countByStatus = input(
    {},
    {
      transform: (value: CountByStatus | undefined) => value ?? ({} as CountByStatus),
    },
  );

  readonly statusClick = output<{ status: Status; count: number; event: MouseEvent }>();

  readonly hasDescendantInvocations = input<boolean | undefined>(false);

  protected readonly allStatusItems = computed(() => {
    const countByStatus = this.countByStatus();
    return Object.entries(countByStatus)
      .map(([status, count]) => this.createStatusItem(status, count))
      .filter((item) => !!item) as StatusItem[];
  });

  protected readonly singleStatus = computed(() => {
    const items = this.allStatusItems();
    if (items.length === 1 && items[0].count === 1) {
      return items[0];
    }
    return undefined;
  });

  protected readonly isEmptyStatus = computed(() => !this.allStatusItems().length);

  protected readonly emptyStatusMessage = computed(() => {
    const isEmptyStatus = this.isEmptyStatus();
    const hasDescendantInvocations = this.hasDescendantInvocations();
    if (!isEmptyStatus) {
      return '';
    }

    return hasDescendantInvocations
      ? 'Execution incomplete — this node may be excluded due to partial tree selection or active filters.'
      : 'No execution — this node may run later, be skipped by workflow logic, or be excluded by partial tree selection or filters.';
  });

  protected handleClick({ status, count }: StatusItem, event: MouseEvent): void {
    this.statusClick.emit({ status, count, event });
  }

  private createStatusItem(status?: string | Status, count?: number): StatusItem | undefined {
    if (!status || !count) {
      return undefined;
    }
    const className = `step-aggregated-status-${status}`;
    const tooltipMessage = `${status}: ${count}`;
    return { className, count, status: status as Status, tooltipMessage };
  }

  protected readonly Status = Status;
}
