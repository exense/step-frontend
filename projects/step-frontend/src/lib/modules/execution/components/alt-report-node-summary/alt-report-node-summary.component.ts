import { ChangeDetectionStrategy, Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { ReportNodeSummary } from '../../shared/report-node-summary';
import { VIEW_MODE } from '../../shared/view-mode';
import { STATUS_COLORS } from '@exense/step-core';
import {
  DoughnutChartItem,
  DoughnutChartSettings,
} from '../../../timeseries/components/doughnut-chart/doughnut-chart-settings';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'step-alt-report-node-summary',
  templateUrl: './alt-report-node-summary.component.html',
  styleUrl: './alt-report-node-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AltReportNodeSummaryComponent {
  private _statusColors = inject(STATUS_COLORS);
  protected readonly _mode = inject(VIEW_MODE);

  /** @Input() **/
  readonly title = input('');

  /** @Input() **/
  readonly summary = input.required<ReportNodeSummary>();

  protected readonly legend = computed(() => {
    const summary = this.summary();
    const keysSet = new Set(Object.keys(summary));
    keysSet.delete('total');
    keysSet.add('TECHNICAL_ERROR');
    keysSet.add('FAILED');

    const items = Array.from(keysSet).map((status) => {
      const value = summary?.[status] ?? 0;
      return { status, value };
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

    if (!dictionary) {
      return undefined;
    }

    const items: DoughnutChartItem[] = Object.entries(this._statusColors)
      .map(([status, color]) => {
        const value = dictionary[status]?.percent ?? 0;
        return { label: status, background: color, value };
      })
      .filter((item) => item.value > 0);

    return {
      items: items,
      total,
      viewMode: this._mode,
    };
  });

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
