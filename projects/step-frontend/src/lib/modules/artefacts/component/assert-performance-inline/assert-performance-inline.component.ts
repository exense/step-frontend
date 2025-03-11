import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  ArtefactInlineItemsBuilderService,
  ArtefactInlineItemUtilsService,
  BaseInlineArtefactComponent,
} from '@exense/step-core';
import { AssertPerformanceArtefact } from '../../types/assert-performance.artefact';
import { AssertPerformanceListService } from '../../injectables/assert-performance-list.service';

@Component({
  selector: 'step-assert-performance-inline',
  templateUrl: './assert-performance-inline.component.html',
  styleUrl: './assert-performance-inline.component.scss',
  host: {
    class: 'execution-report-node-inline-details',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssertPerformanceInlineComponent extends BaseInlineArtefactComponent<AssertPerformanceArtefact> {
  private _lists = inject(AssertPerformanceListService);
  private _artefactInlineUtilsService = inject(ArtefactInlineItemUtilsService);

  private _itemsBuilder = inject(ArtefactInlineItemsBuilderService)
    .builder<AssertPerformanceArtefact>()
    .extractArtefactItems((artefact, isResolved) => {
      if (!artefact) {
        return undefined;
      }
      const aggregator = this._lists.aggregatorTypeTexts[artefact.aggregator];
      const filter = artefact.filters![0]!.filter;
      const comparator = this._lists.operatorTypeTexts[artefact.comparator];
      const expectedValue = artefact.expectedValue;
      return this._artefactInlineUtilsService.convert(
        [
          [`${aggregator} of`, filter],
          {
            label: comparator,
            value: expectedValue,
            timeValueUnit: 'ms',
          },
        ],
        isResolved,
      );
    });

  protected items = computed(() => this._itemsBuilder.build(this.currentContext()));
}
