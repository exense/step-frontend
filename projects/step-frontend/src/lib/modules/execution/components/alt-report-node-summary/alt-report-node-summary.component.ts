import { ChangeDetectionStrategy, Component, computed, inject, input, model, ViewEncapsulation } from '@angular/core';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE } from '../../shared/view-mode';
import { GRID_LAYOUT_CONFIG, NumberSeparateThousandsPipe, STATUS_COLORS } from '@exense/step-core';
import {
  ChartItemClickEvent,
  DoughnutChartItem,
  DoughnutChartSettings,
} from '../../../charts/types/doughnut-chart-settings';
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
  standalone: false,
  providers: [NumberSeparateThousandsPipe],
})
export class AltReportNodeSummaryComponent {
  private _statusColors = inject(STATUS_COLORS);
  private _numberSeparateThousands = inject(NumberSeparateThousandsPipe);
  private _gridLayoutConfig = inject(GRID_LAYOUT_CONFIG, { optional: true });
  protected readonly _mode = inject(VIEW_MODE);

  protected readonly hasGrid = !!this._gridLayoutConfig;

  readonly title = input('');
  readonly disableChartItemClick = input(false);

  readonly summary = input.required<ReportNodeSummary>();

  readonly statusFilterModel = model<Status[]>([], { alias: 'statusFilter' });

  readonly totalTooltipInput = input<string | undefined>(undefined, { alias: 'totalTooltip' });
  readonly totalForecastTooltipInput = input<string | undefined>(undefined, { alias: 'totalForecastTooltip' });

  private readonly statusFilter = computed(() => new Set(this.statusFilterModel()));

  private readonly availableStatuses = computed(() => {
    const summary = this.summary();
    const keysSet = new Set(Object.keys(summary.items));
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
      const value = summary?.items?.[status] ?? 0;
      const isDisabled = !isFilterEmpty && !statusFilter.has(status);
      return { status, value, isDisabled };
    });

    return items;
  });

  private readonly summaryDistinct = toSignal(
    toObservable(this.summary).pipe(
      distinctUntilChanged((previous, current) => this.areSummariesEqual(previous, current)),
    ),
  );

  private readonly dictionary = computed(() => {
    const summary = this.summaryDistinct();

    if (!summary?.total && !summary?.countForecast) {
      return {
        ['EMPTY']: { value: 100, percent: 100 },
      };
    }

    const total = summary.countForecast ?? summary.total;

    const result = Object.keys(this._statusColors).reduce(
      (res, key) => {
        const value = summary.items[key];
        if (value > 0) {
          const percent = this.calcPercent(value, total);
          res[key] = { value, percent };
        }
        return res;
      },
      {} as Record<string, { value: number; percent: number }>,
    );

    if (summary.countForecast !== undefined) {
      const remains = summary.countForecast - summary.total;
      const percent = this.calcPercent(remains, total);
      result['EMPTY'] = { value: remains, percent };
    }

    return result;
  });

  protected readonly chartSettings = computed<DoughnutChartSettings | undefined>(() => {
    const dictionary = this.dictionary();
    const summaryDistinct = this.summaryDistinct();

    const total = summaryDistinct?.total ?? 0;
    const countForecast = summaryDistinct?.countForecast;

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
      viewMode: this._mode,
    };
  });

  protected readonly total = computed(() => this.summaryDistinct()?.total ?? 0);
  protected readonly totalForecast = computed(() => this.summaryDistinct()?.countForecast);

  protected readonly totalTooltip = computed(() => {
    const prefix = this.totalTooltipInput();
    const total = this.total();
    return this.formatTotalTooltip(prefix, total);
  });
  protected readonly totalForecastTooltip = computed(() => {
    const prefix = this.totalForecastTooltipInput();
    const total = this.totalForecast();
    return this.formatTotalTooltip(prefix, total);
  });

  protected toggleChartItem(event: ChartItemClickEvent): void {
    if (this.disableChartItemClick()) {
      return;
    }
    const status = event.item.label as Status;
    const preventOtherSelection = !!event.ctrlKey || !!event.shiftKey;
    this.toggleStatusFilter(status, preventOtherSelection);
  }

  protected toggleStatusFilter(status: Status, preventOtherSelection: boolean): void {
    if (this.disableChartItemClick()) {
      return;
    }
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

    if (a!.total !== b!.total || a!.countForecast !== b!.countForecast) {
      return false;
    }

    const itemsA = a!.items!;
    const itemsB = b!.items!;

    const keysA = Object.keys(itemsA);
    const keysB = Object.keys(itemsB);
    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (itemsA[key] !== itemsB[key]) {
        return false;
      }
    }

    return true;
  }

  private formatTotalTooltip(prefix?: string, total?: number | null): string {
    return [prefix, this._numberSeparateThousands.transform(total)].filter((part) => !!part).join(': ');
  }
}
