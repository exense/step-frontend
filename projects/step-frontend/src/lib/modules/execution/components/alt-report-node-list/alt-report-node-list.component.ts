import { Component, computed, input, model } from '@angular/core';
import { ReportNode, TimeRange } from '@exense/step-core';

type KeywordStatus = ReportNode['status'];

@Component({
  selector: 'step-alt-report-node-list',
  templateUrl: './alt-report-node-list.component.html',
  styleUrl: './alt-report-node-list.component.scss',
})
export class AltReportNodeListComponent {
  /** @Input() **/
  title = input('');

  /** @Input() **/
  allReportNodes = input.required({
    alias: 'reportNodes',
    transform: (value?: ReportNode[]) => value ?? [],
  });

  showDates = input(false);

  search = model('');

  selectedStatuses = model<KeywordStatus[]>([]);

  statuses = computed(() => {
    const statuses = (this.allReportNodes() ?? []).map((keyword) => keyword.status);
    return Array.from(new Set(statuses));
  });

  timeRange = input<TimeRange | undefined>(undefined);

  reportNodes = computed(() => {
    let result = this.allReportNodes();

    const range = this.timeRange();
    if (range?.from && range?.to) {
      result = result.filter(
        (node) => node.executionTime && node.executionTime >= range.from && node.executionTime <= range.to,
      );
    }

    const selectedStatuses = new Set(this.selectedStatuses());
    if (selectedStatuses.size) {
      result = result.filter((node) => selectedStatuses.has(node.status));
    }

    const search = this.search().trim().toLowerCase();
    if (search) {
      result = result.filter((node) => (node.name ?? '').toLowerCase().includes(search));
    }

    return result;
  });
}
