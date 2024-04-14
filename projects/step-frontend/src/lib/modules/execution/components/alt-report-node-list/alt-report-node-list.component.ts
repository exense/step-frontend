import { Component, computed, input, model } from '@angular/core';
import { ReportNode } from '@exense/step-core';

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

  search = model('');

  selectedStatuses = model<KeywordStatus[]>([]);

  statuses = computed(() => {
    const statuses = (this.allReportNodes() ?? []).map((keyword) => keyword.status);
    return Array.from(new Set(statuses));
  });

  reportNodes = computed(() => {
    let result = this.allReportNodes();

    const selectedStatuses = new Set(this.selectedStatuses());
    if (selectedStatuses.size) {
      result = result.filter((keyword) => selectedStatuses.has(keyword.status));
    }

    const search = this.search().trim().toLowerCase();
    if (search) {
      result = result.filter((keyword) => (keyword.name ?? '').toLowerCase().includes(search));
    }

    return result;
  });
}
