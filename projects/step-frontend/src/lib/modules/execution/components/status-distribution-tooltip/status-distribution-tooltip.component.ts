import { Component, computed, inject, input, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StatusDistributionBadgeComponent } from './badge/status-distribution-badge.component';

interface InternalStatusDistribution extends StatusDistributionItem {
  percentage: number;
}

export interface StatusDistributionItem {
  color: string;
  label: string;
  count: number;
}

@Component({
  selector: 'step-status-distribution-tooltip',
  templateUrl: './status-distribution-tooltip.component.html',
  styleUrls: ['./status-distribution-tooltip.component.scss'],
  standalone: true,
  imports: [DatePipe, StatusDistributionBadgeComponent],
})
export class StatusDistributionTooltipComponent {
  private _router = inject(Router);

  readonly statuses = input.required<StatusDistributionItem[]>();
  readonly timestamp = input<number>();
  readonly link = input<string>();
  readonly linkLabel = input<string>();

  protected distribution: Signal<InternalStatusDistribution[]> = computed(() => {
    const list = this.statuses() ?? [];
    const totalCount = list.reduce((acc, item) => acc + (item?.count ?? 0), 0);

    return list
      .map((item: StatusDistributionItem) => {
        const count = item?.count ?? 0;
        const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
        return { label: item.label, count, color: item.color, percentage };
      })
      .sort((a, b) => b.percentage - a.percentage);
  });

  protected navigateToLink() {
    if (this.link()) {
      this._router.navigateByUrl(this.link()!);
    }
  }
}
