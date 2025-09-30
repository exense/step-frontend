import { Component, computed, inject, input, Signal } from '@angular/core';
import { Router } from '@angular/router';

interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

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
