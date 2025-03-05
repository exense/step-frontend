import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ArtefactService, BaseReportDetailsComponent, ReportNodeWithArtefact } from '@exense/step-core';
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
})
export class AssertPerformanceReportDetailsComponent extends BaseReportDetailsComponent<
  ReportNodeWithArtefact<AssertPerformanceArtefact>
> {
  private _lists = inject(AssertPerformanceListService);
  private _artefactService = inject(ArtefactService);

  protected items = computed(() => {
    let result: Record<string, unknown> | undefined = undefined;
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return result;
    }
    const aggregator = this._lists.aggregatorTypeTexts[artefact.aggregator];
    const filter = artefact.filters![0]!.filter;
    const comparator = this._lists.operatorTypeTexts[artefact.comparator];
    const expectedValue = this._artefactService.convertTimeDynamicValue(artefact.expectedValue);
    result = {};
    result[`${aggregator} of`] = this._artefactService.convertDynamicValue(filter);
    result[comparator] = expectedValue;
    return result;
  });
}
