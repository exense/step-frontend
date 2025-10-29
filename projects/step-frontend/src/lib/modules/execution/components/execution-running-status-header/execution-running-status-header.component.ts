import { ChangeDetectionStrategy, Component, computed, input, output, ViewEncapsulation } from '@angular/core';

const MAX_DISPLAY_COUNT_IN_BADGE = 9;

@Component({
  selector: 'step-execution-running-status-header',
  templateUrl: './execution-running-status-header.component.html',
  styleUrls: ['./execution-running-status-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  host: {
    '(click)': 'handleClick($event)',
  },
})
export class ExecutionRunningStatusHeaderComponent {
  readonly runningExecutionsCount = input(0, {
    transform: (value?: number | null) => value ?? 0,
  });
  readonly statusBadgeClick = output<void>();

  protected badgeText = computed(() => {
    const count = this.runningExecutionsCount();
    return count > MAX_DISPLAY_COUNT_IN_BADGE ? '+' : count.toString();
  });

  protected tooltipText = computed(() => {
    const count = this.runningExecutionsCount();
    return `Currently running executions: ${count}`;
  });

  protected handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('step-badge')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.statusBadgeClick.emit();
  }
}
