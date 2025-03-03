import { Component } from '@angular/core';
import { ArtefactInlineItem, BaseInlineArtefactLegacyComponent, DynamicValueString } from '@exense/step-core';
import { AssertPerformanceArtefact } from '../../types/assert-performance.artefact';

@Component({
  selector: 'step-assert-performance-inline',
  templateUrl: './assert-performance-inline.component.html',
  styleUrl: './assert-performance-inline.component.scss',
})
export class AssertPerformanceInlineComponent extends BaseInlineArtefactLegacyComponent<AssertPerformanceArtefact> {
  protected getItems(
    artefact?: AssertPerformanceArtefact,
    isVertical?: boolean,
    isResolved?: boolean,
  ): ArtefactInlineItem[] | undefined {
    if (!artefact) {
      return undefined;
    }

    let filters: [string, string | DynamicValueString | undefined][] = [];
    if (artefact.filters?.length) {
      filters = [
        ['Filters:', undefined],
        ...(artefact
          .filters!.map((filter) => [
            ['Filter Type', filter.filterType],
            ['Field', filter.field],
            ['Filter', filter.filter],
          ])
          .flat() as [string, string | DynamicValueString][]),
      ];
    }

    return this.convert(
      [
        ['Aggregator', artefact.aggregator],
        ['Comparator', artefact.comparator],
        ['Expected Value', artefact.expectedValue],
        ...filters,
      ],
      isResolved,
    );
  }
}
