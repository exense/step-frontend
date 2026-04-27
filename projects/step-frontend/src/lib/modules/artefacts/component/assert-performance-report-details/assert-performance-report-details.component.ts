import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemUtilsService,
  BaseReportDetailsComponent,
  ItemType,
  ReportNodeWithArtefact,
} from '@exense/step-core';
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

  protected readonly items = computed(() => {
    const artefact = this.node()?.resolvedArtefact;
    if (!artefact) {
      return undefined;
    }
    const aggregator = this._lists.aggregatorTypeTexts[artefact.aggregator];
    const filter = artefact.filters![0]!.filter;
    const comparator = this._lists.operatorTypeTexts[artefact.comparator];
    const expectedValue = artefact.expectedValue;
    return this._artefactInlineUtilsService.convert([
      { label: 'aggregator', value: aggregator, itemType: ItemType.CONFIGURATION },
      { label: 'filter', value: filter, itemType: ItemType.CONFIGURATION },
      { label: 'comparator', value: comparator, itemType: ItemType.CONFIGURATION },
      { label: 'expected value', value: expectedValue, timeValueUnit: 'ms', itemType: ItemType.CONFIGURATION },
    ]);
  });
}
