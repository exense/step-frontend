import { ChangeDetectionStrategy, Component, computed, inject, input, model, ViewEncapsulation } from '@angular/core';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE } from '../../shared/view-mode';
import { STATUS_COLORS } from '@exense/step-core';
import {
  ChartItemClickEvent,
  DoughnutChartItem,
  DoughnutChartSettings,
} from '../../../timeseries/components/doughnut-chart/doughnut-chart-settings';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { Status } from '../../../_common/shared/status.enum';

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[attr.title]': 'null',
  },
})
export class AltReportNodeSummaryComponent {
  private _statusColors = inject(STATUS_COLORS);
  protected readonly _mode = inject(VIEW_MODE);

  readonly title = input('');

  readonly summary = input.required<ReportNodeSummary>();

  readonly statusFilterModel = model<Status[]>([], { alias: 'statusFilter' });

  readonly totalTooltip = input<string | undefined>();

  private statusFilter = computed(() => new Set(this.statusFilterModel()));

  private availableStatuses = computed(() => {
    const summary = this.summary();
    const keysSet = new Set(Object.keys(summary));
    keysSet.delete('total');
    keysSet.add(Status.TECHNICAL_ERROR);
    keysSet.add(Status.FAILED);
    return Array.from(keysSet as Set<Status>);
  });

  protected readonly legend = computed(() => {
    const summary = this.summary();
    const availableStatuses = this.availableStatuses();
    const statusFilter = this.statusFilter();
    const isFilterEmpty = !statusFilter.size;

    const items = availableStatuses.map((status) => {
      const value = summary?.[status] ?? 0;
      const isDisabled = !isFilterEmpty && !statusFilter.has(status);
      return { status, value, isDisabled };
    });

    return items;
  });

  private summaryDistinct = toSignal(
    toObservable(this.summary).pipe(
      distinctUntilChanged((previous, current) => this.areSummariesEqual(previous, current)),
    ),
  );

  private dictionary = computed(() => {
    const summary = this.summaryDistinct();

    if (!summary?.total) {
      return {
        ['EMPTY']: { value: 100, percent: 100 },
      };
    }
    return Object.keys(this._statusColors).reduce(
      (res, key) => {
        const value = summary[key];
        if (value > 0) {
          const percent = this.calcPercent(value, summary.total);
          res[key] = { value, percent };
        }
        return res;
      },
      {} as Record<string, { value: number; percent: number }>,
    );
  });

  protected readonly chartSettings = computed<DoughnutChartSettings | undefined>(() => {
    const dictionary = this.dictionary();
    const total = this.summaryDistinct()?.total ?? 0;
    const statusFilter = this.statusFilter();
    const isFilterEmpty = !statusFilter.size;

    if (!dictionary) {
      return undefined;
    }

    const items: DoughnutChartItem[] = Object.entries(this._statusColors)
      .map(([status, color]) => {
        const value = dictionary[status]?.percent ?? 0;
        const background = isFilterEmpty || statusFilter.has(status as Status) ? color : this._statusColors.UNKNOW;
        return { label: status, background, value };
      })
      .filter((item) => item.value > 0);

    return {
      items: items,
      total,
      viewMode: this._mode,
    };
  });

  protected toggleChartItem(event: ChartItemClickEvent) {
    const status = event.item.label as Status;
    const preventOtherSelection = !!event.ctrlKey || !!event.shiftKey;
    this.toggleStatusFilter(status, preventOtherSelection);
  }

  protected toggleStatusFilter(status: Status, preventOtherSelection: boolean) {
    this.statusFilterModel.update((value) => {
      const statusSet = new Set(value);
      if (!preventOtherSelection) {
        const hasCurrentStatus = statusSet.has(status);
        statusSet.clear();
        if (hasCurrentStatus) {
          statusSet.add(status);
        }
      }

      if (statusSet.has(status)) {
        statusSet.delete(status);
      } else {
        statusSet.add(status);
      }

      return Array.from(statusSet);
    });
  }

  private calcPercent(count: number, total: number): number {
    return Math.max(total ? Math.floor((count / total) * 100) : 0, 1);
  }

  private areSummariesEqual(a?: ReportNodeSummary, b?: ReportNodeSummary): boolean {
    if (a === b) {
      return true;
    }
    if ((!!a && !b) || (!a && !!b)) {
      return false;
    }
    const keysA = Object.keys(a!);
    const keysB = Object.keys(b!);
    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (a![key] !== b![key]) {
        return false;
      }
    }

    return true;
  }
}
