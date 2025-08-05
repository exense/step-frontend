import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactInlineItemUtilsService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
import { AssertPerformanceArtefact } from '../../types/assert-performance.artefact';
import { AssertPerformanceListService } from '../../injectables/assert-performance-list.service';

@Component({
  selector: 'step-assert-performance-report-details',
  templateUrl: './assert-performance-report-details.component.html',
  styleUrl: './assert-performance-report-details.component.scss',
  host: {
    class: 'execution-report-node-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AssertPerformanceReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<AssertPerformanceArtefact>
> {
  private _lists = inject(AssertPerformanceListService);
  private _artefactInlineUtilsService = inject(ArtefactInlineItemUtilsService);

  protected items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    const aggregator = this._lists.aggregatorTypeTexts[artefact.aggregator];
    const filter = artefact.filters![0]!.filter;
    const comparator = this._lists.operatorTypeTexts[artefact.comparator];
    const expectedValue = artefact.expectedValue;
    return this._artefactInlineUtilsService.convert([
      ['aggregator', aggregator, 'log-in'],
      ['filter', filter, 'log-in'],
      ['comparator', comparator, 'log-in'],
      {
        label: 'expected value',
        value: expectedValue,
        timeValueUnit: 'ms',
        icon: 'log-in',
      },
    ]);
  });
}
