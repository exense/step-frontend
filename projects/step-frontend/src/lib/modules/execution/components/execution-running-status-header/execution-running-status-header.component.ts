import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

const MAX_DISPLAY_COUNT_IN_BADGE = 9;

@Component({
  selector: 'step-execution-running-status-header',
  templateUrl: './execution-running-status-header.component.html',
  styleUrls: ['./execution-running-status-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ExecutionRunningStatusHeaderComponent implements OnChanges {
  @Input() runningExecutionsCount?: number | null;
  @Output() statusBadgeClick = new EventEmitter<void>();

  protected badgeText: string = '';
  protected tooltipText: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    const cRunningExecutions = changes['runningExecutionsCount'];
    if (cRunningExecutions?.previousValue !== cRunningExecutions?.currentValue || cRunningExecutions?.firstChange) {
      const count = cRunningExecutions?.currentValue ?? 0;
      this.badgeText = count > MAX_DISPLAY_COUNT_IN_BADGE ? '+' : count.toString();
      this.tooltipText = `Currently running executions: ${count}`;
    }
  }

  @HostListener('click', ['$event'])
  handleBadgeClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('step-badge')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.statusBadgeClick.emit();
  }
}
