import { Component, computed, input, model, ViewEncapsulation } from '@angular/core';
import { ReportNode, TimeRange } from '@exense/step-core';
import { AltReportNodesListService } from '../../services/alt-report-nodes-list.service';

type KeywordStatus = ReportNode['status'];

@Component({
  selector: 'step-alt-report-node-list',
  templateUrl: './alt-report-node-list.component.html',
  styleUrl: './alt-report-node-list.component.scss',
  providers: [
    {
      provide: AltReportNodesListService,
      useExisting: AltReportNodeListComponent,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeListComponent implements AltReportNodesListService {
  /** @Input() **/
  title = input('');

  /** @Input() **/
  allReportNodes = input.required({
    alias: 'reportNodes',
    transform: (value?: ReportNode[]) => value ?? [],
  });

  readonly search = model('');

  readonly selectedStatuses = model<KeywordStatus[]>([]);

  readonly statuses = computed(() => {
    const statuses = (this.allReportNodes() ?? []).map((keyword) => keyword.status);
    return Array.from(new Set(statuses));
  });

  readonly showNonPassedFilterBtn = computed(() => {
    const statuses = this.statuses();
    return statuses.includes('PASSED') && statuses.length > 0;
  });

  timeRange = input<TimeRange | undefined>(undefined);

  readonly reportNodes = computed(() => {
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

  filterNonPassed(): void {
    const statuses = this.statuses().filter((status) => status !== 'PASSED');
    this.selectedStatuses.set(statuses);
  }
}
