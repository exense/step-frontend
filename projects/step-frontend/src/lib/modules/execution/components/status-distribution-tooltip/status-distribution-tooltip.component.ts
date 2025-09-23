import { Component, computed, inject, input, Signal } from '@angular/core';
import { Router } from '@angular/router';

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

const STATUS_COLORS: Record<string, string> = {
  VETOED: '#000000',
  TECHNICAL_ERROR: '#000000',
  IMPORT_ERROR: '#000000',
  FAILED: '#ff595b',
  INTERRUPTED: '#e1cc01',
  PASSED: '#01a990',
  SKIPPED: '#a0a0a0',
  NORUN: '#a0a0a0',
  UNKNOWN: '#a0a0a0',
};

@Component({
  selector: 'step-status-distribution-tooltip',
  templateUrl: './status-distribution-tooltip.component.html',
  styleUrls: ['./status-distribution-tooltip.component.scss'],
  standalone: false,
})
export class StatusDistributionTooltipComponent {
  private _router = inject(Router);

  statuses = input.required<Record<string, number>>();
  timestamp = input<number>();
  link = input<string>();
  linkLabel = input<string>();

  distribution: Signal<StatusDistribution[]> = computed(() => {
    let totalCount = 0;
    const statuses = this.statuses();

    Object.keys(statuses).forEach((status) => {
      totalCount += statuses[status];
    });
    return Object.keys(statuses)
      .map((status) => {
        const count = statuses[status];
        const percentage = (count / totalCount) * 100;
        return { status, count, percentage };
      })
      .sort((a, b) => b.percentage - a.percentage);
  });

  navigateToLink() {
    if (this.link()) {
      this._router.navigateByUrl(this.link()!);
    }
  }
}
